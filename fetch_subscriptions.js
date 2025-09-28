/* 
 *  run the scription locally
 *  node fetch_subscriptions.js ${xboard_api_secret} ${xboard_api_url}
 */

const fs = require("fs");
const outputfile = "dest/free-subscriptions.json";

function fetchSubscriptions(credentials, xboard_api_url) {
    console.log("Fetching subscriptions...");

    const subscriptions = [];

    fetch(
        `${xboard_api_url}/fetch?filter[0][key]=email&filter[0][condition]=%E6%A8%A1%E7%B3%8A&filter[0][value]=freea1&pageSize=15&current=1&total=3490`,
        {
            method: "GET",
            headers: {
                Authorization: `${credentials}`,
                "Content-Type": "application/json", // Adjust content type as needed
            },
        }
    )
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            data.data.forEach((item) => {
                subscriptions.push({
                    url:
                        "https://vip16.20250920.top/api/v1/client/subscribe?token=" +
                        item.token,
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