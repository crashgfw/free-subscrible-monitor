/*
 *  run the scription locally
 *  export xboard_api_secret="xxx"
 *  export xboard_api_url="https://example.com"
 *  node generate_markdown6.js ${xboard_api_secret} ${xboard_api_url}
 */

const fs = require("fs");
const Handlebars = require("handlebars");
const fetch = require("fetch-retry")(global.fetch, {
    retries: 8,
    retryDelay: 1200,
});

function fetchSubscriptions(credentials, xboard_api_url) {
    console.log("Fetching subscriptions...");

    const templateSource = fs.readFileSync("readme-template6.md", "utf8");
    const template = Handlebars.compile(templateSource);

    const subscriptions = [];

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

    fs.writeFileSync("dest6/README.md", markdownContent, "utf8");
    console.log("Markdown file generated successfully!");
    
}

//获取脚本的第一个参数作为credentials
const credentials = process.argv[2];
const xboardurl = process.argv[3];

fetchSubscriptions(credentials, xboardurl);
