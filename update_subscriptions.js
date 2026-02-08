/*
 *  run the scription locally
 *  export xboard_api_secret="xxx"
 *  export xboard_api_url="https://example.com"
 *  node update_subscriptions.js ${xboard_api_secret} ${xboard_api_url}
 */
const fetch = require("fetch-retry")(global.fetch, {
    retries: 8,
    retryDelay: 1200,
});

function updateSubscriptions(credentials, xboard_api_url) {
    console.log("Updating subscriptions...");

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
                console.error(response.status);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            if (data.data.length === 0) {
                console.log("No subscriptions found");
                throw new Error("No subscriptions found");
            }
            //console.log("item", item);
            const now = new Date();
            // 构造 "明天 10:00"
            const today23 = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(), // 明天
                23, // 10 点
                0,
                0,
                0
            );

            const today23Sec = Math.floor(today23.getTime() / 1000);
            const nowSec = Math.floor(Date.now() / 1000);

            data.data.forEach((item) => {
                if (
                    item.total_used >= item.transfer_enable ||
                    item.expired_at < today23Sec
                ) {
                    if (item.total_used >= item.transfer_enable) {
                        console.log("update record due to traffic used up ", item.id);
                        item.u = 0;
                        item.d = 0;
                    }

                    if (item.expired_at < today23Sec) {
                        console.log("update record due to expiring for ", item.id);
                        // 在当前时间基础上增加 15天（15 * 24 * 60 * 60 秒）
                        item.expired_at = nowSec + 15 * 24 * 60 * 60;
                    }

                    fetch(`${xboard_api_url}/update`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${credentials}`,
                            "Content-Type": "application/json", // Adjust content type as needed
                        },
                        body: JSON.stringify(item),
                    }).then((response) => {
                        console.log(
                            "reset uuid & subscription url for:",
                            item.id
                        );
                        fetch(`${xboard_api_url}/resetSecret`, {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${credentials}`,
                                "Content-Type": "application/json", // Adjust content type as needed
                            },
                            body: JSON.stringify({ id: item.id }),
                        })
                            .then((response) => {
                                console.log(
                                    "reset uuid & subscription url successfully for",
                                    item.id
                                );
                            })
                            .catch((error) => {
                                console.error(
                                    "reset uuid & subscription url with error for",
                                    item.id
                                );
                            });
                    });
                }
            });
        })
        .catch((error) => {
            console.error("An error occurred:", error.message);
            console.error("Stack trace:", error.stack);
            throw new Error(`Updating error`);
        })
        .finally(() => {
            console.info("update is done!")
        });
}

//获取脚本的第一个参数作为credentials
const credentials = process.argv[2];
const xboardurl = process.argv[3];

updateSubscriptions(credentials, xboardurl);
