const axios = require('axios');
const fs = require('fs');

const APOLLO_API_KEY = 'g3dJ1LBHTJ5KmhRn_w4aCg';

async function getCoFounders() {
    // Humne URL change kiya hai: 'mixed_people' ki jagah sirf 'people'
    const url = 'https://api.apollo.io/v1/people/search';

    const data = {
        q_keywords: "Founder, Co-Founder",
        person_locations: ["India"],
        page: 1,
        per_page: 20 // Chota number rakhein taaki block na ho
    };

    try {
        console.log("Fetching data using People Search API...");
        
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'X-Api-Key': APOLLO_API_KEY 
            }
        });

        const people = response.data.people || response.data.contacts;

        if (!people || people.length === 0) {
            console.log("No data found. Ho sakta hai is endpoint par bhi restriction ho.");
            return;
        }

        // JSON mein save karna
        fs.writeFileSync('cofounders_data.json', JSON.stringify(people, null, 4));
        console.log(`\n✅ Success! ${people.length} founders ka data save ho gaya.`);
        
    } catch (error) {
        if (error.response && error.response.status === 403) {
            console.error("❌ Apollo ne Free API access block kar diya hai.");
            console.log("Solution: Apollo Extension se CSV export karke use karein.");
        } else {
            console.error('Error Details:', error.response ? error.response.data : error.message);
        }
    }
}

getCoFounders();