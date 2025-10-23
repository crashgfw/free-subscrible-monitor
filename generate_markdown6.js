const fs = require("fs");
const Handlebars = require("handlebars");
const fetch = require("fetch-retry")(global.fetch, {
    retries: 5,
    retryDelay: 800,
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
