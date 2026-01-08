/*
 *  run the scription locally
 *  export xboard_api_secret="xxx"
 *  export xboard_api_url="https://example.com"
 *  node generate_markdown2.js ${xboard_api_secret} ${xboard_api_url}
 */
const fs = require("fs");
const Handlebars = require("handlebars");
const fetch = require("fetch-retry")(global.fetch, {
    retries: 5,
    retryDelay: 800,
});

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
    
    fetch(
        `${xboard_api_url}/fetch`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${credentials}`,
                "Content-Type": "application/json", // Adjust content type as needed
            },
            body: JSON.stringify(params),
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
                        "https://fn09.sp1230.top/s/" +
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
            throw new Error(`Generating MD error`);
        });
}

//获取脚本的第一个参数作为credentials
const credentials = process.argv[2];
const xboardurl = process.argv[3];

fetchSubscriptions(credentials, xboardurl);
