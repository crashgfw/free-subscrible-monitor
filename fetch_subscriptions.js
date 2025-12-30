/*
 *  run the scription locally
 *  export xboard_api_secret="xxx"
 *  export xboard_api_url="https://example.com"
 *  node fetch_subscriptions.js ${xboard_api_secret} ${xboard_api_url}
 */

const fs = require("fs");
const outputfile = "dest/free-subscriptions.json";
const fetch = require("fetch-retry")(global.fetch, {
    retries: 5,
    retryDelay: 800,
});

function fetchSubscriptions(credentials, xboard_api_url) {
    console.log("Fetching subscriptions...");

    const subscriptions = [];

    const params = {
        pageSize: 20,
        current: 1,
        filter: [
            {
                id: "email",
                value: "freea1",
            },
        ],
        sort: [],
    };

    fetch(`${xboard_api_url}/fetch`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${credentials}`,
            "Content-Type": "application/json", // Adjust content type as needed
        },
        body: JSON.stringify(params),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            data.data.forEach((item) => {
                subscriptions.push({
                    url: "https://fn07.sp1230.top/s/" + item.token,
                });
            });

            if (subscriptions.length === 0) {
                throw new Error("No subscriptions found");
            }
            console.log("Fetch successfully completed.");

            fs.writeFileSync(
                outputfile,
                JSON.stringify({
                    date:
                        new Date()
                            .toLocaleDateString("zh-CN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })
                            .replace(/\//g, " 年 ")
                            .replace(/(\d{2}) 年 (\d{2}) 年/, "$1 年 $2 月") +
                        " 日",
                    subscriptions: subscriptions,
                })
            );
            console.log("Data was saved to " + outputfile);
        })
        .catch((error) => {
            console.error("Error:", error);
            throw new Error(`fetching error`);
        });
}

//获取脚本的第一个参数作为credentials
const credentials = process.argv[2];
const xboardurl = process.argv[3];

fetchSubscriptions(credentials, xboardurl);
