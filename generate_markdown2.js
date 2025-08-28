const fs = require("fs");
const Handlebars = require("handlebars");

function encodeUnicode(str) {
    let result = "";
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code > 127) {
            let unic = code.toString(16);
            while (unic.length < 4) {
                unic = "0" + unic;
            }
            result += "\\u" + unic;
        } else {
            result += str[i];
        }
    }
    return result.replaceAll("/", "\\/");
}

function fetchSubscriptions(credentials, xboard_api_url) {
    console.log("Fetching subscriptions...");

    const templateSource = fs.readFileSync("readme-template2.md", "utf8");
    const template = Handlebars.compile(templateSource);

    const subscriptions = [];

    fetch(
        `${xboard_api_url}/api/v1/todiegfw/user/fetch?filter[0][key]=email&filter[0][condition]=%E6%A8%A1%E7%B3%8A&filter[0][value]=freea1&pageSize=15&current=1&total=3490`,
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
                        "https://vip10.20250812.xyz/api/v1/client/subscribe?token=" +
                        item.token,
                });
            });

            if (subscriptions.length === 0) {
                throw new Error("No subscriptions found");
            }
            console.log("Fetch successfully completed.");

            const markdownContent = template({
                today:
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
            });

            fs.writeFileSync("dest2/README.md", markdownContent, "utf8");
            console.log("Markdown file generated successfully!");
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

//获取脚本的第一个参数作为credentials
const credentials = process.argv[2];
const xboardurl = process.argv[3];

fetchSubscriptions(credentials, xboardurl);
