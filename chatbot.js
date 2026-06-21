// chatbot.js
const BOT_PROXY = '/api/chatbot_proxy.php';
const FIND_DONORS = '/api/find_donors.php';
const SEND_ALERT = '/api/send_alert.php';

function openChat(){
    const box = document.getElementById('chatbot-box');
    box.style.display = box.style.display === 'flex' ? 'none' : 'flex';
}

function addMessage(text, sender='bot'){
    const cont = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = sender === 'bot' ? 'chatbot-msg-bot' : 'chatbot-msg-user';
    div.innerText = text;
    cont.appendChild(div);
    cont.scrollTop = cont.scrollHeight;
}

async function onSend(){
    const input = document.getElementById('chatbot-input');
    const text = input.value.trim();
    if(!text) return;
    addMessage(text, 'user');
    input.value = '';

    // Quick local intent parsing for donor search
    if(/find|nearest|near me|closest|nearby/i.test(text)){
        addMessage("Please allow location or type your location (lat,lng). Searching for donors...", 'bot');

        // Try to use browser geolocation
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(async (pos)=>{
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                // try to detect blood group mentioned
                const bgMatch = text.match(/(A|B|AB|O)[+-]?/i);
                const bg = bgMatch ? bgMatch[0].toUpperCase() : '';
                if(!bg){
                    addMessage("Which blood group do you need? (e.g., O+, A-)", 'bot');
                    return;
                }
                const payload = { blood_group: bg, lat: lat, lng: lng, radius_km: 20 };
                const res = await fetch(FIND_DONORS, {
                    method:'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                if(data.error){ addMessage("Error: "+data.error,'bot'); return; }
                if(data.count === 0){ addMessage("No nearby donors found within radius.","bot"); return; }
                addMessage(`Found ${data.count} donors. Do you want to send alerts to first 5? (yes/no)`, 'bot');

                // Save donors in temporary state on window for later send
                window._last_found_donors = data.donors.slice(0,5);
                // show donors
                data.donors.slice(0,5).forEach(d=>{
                    addMessage(`${d.name} (${d.blood_group}) - ${d.distance_km ? d.distance_km.toFixed(2)+' km' : ''}\n${d.maps_url}\nPhone: ${d.phone}`, 'bot');
                });
            }, (err)=>{
                addMessage("Unable to get location: " + err.message, 'bot');
            });
        } else {
            addMessage("Geolocation not supported. Please enter lat,lng manually.", 'bot');
        }
        return;
    }

    // Quick intent: user wants to send alerts to found donors
    if(/^yes$/i.test(text) && window._last_found_donors){
        const ids = window._last_found_donors.map(d=>d.id);
        const message = "URGENT: Need blood " + (window.requestedBg || '') + ". Please contact hospital: 011-xxxxxxx";
        const res = await fetch(SEND_ALERT, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ donor_ids: ids, message: message })
        });
        const r = await res.json();
        addMessage("Alerts sent. Response: " + JSON.stringify(r), 'bot');
        window._last_found_donors = null;
        return;
    }

    // Otherwise forward message to AI proxy
    addMessage('Thinking...', 'bot');
    try {
        const resp = await fetch(BOT_PROXY, {
            method:'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ message: text })
        });
        const data = await resp.json();

        // parse response for common fields (depends on Gemini response shape)
        let reply = '';
        if(typeof data === 'string') reply = data;
        else if(data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            reply = data.candidates[0].content.parts[0].text;
        } else if(data?.output?.[0]?.content) {
            // try alternate shape
            reply = JSON.stringify(data.output);
        } else {
            reply = JSON.stringify(data);
        }
        addMessage(reply, 'bot');
    } catch(e){
        addMessage("API error: "+e.message, 'bot');
    }
}
