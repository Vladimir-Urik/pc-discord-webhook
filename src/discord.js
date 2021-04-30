const discord = require('discord.js');
const MAX_MESSAGE_LENGTH = 40;

module.exports.send = (id, token, repo, branch, url, commits, size, report) => new Promise((resolve, reject) => {
    var client;
    console.log("Preparing Webhook...");
    try {
        client = new discord.WebhookClient(id, token);
    }
    catch (error) {
        reject(error.message);
        return;
    }

    client.send(createEmbed(repo, branch, url, commits, size, report)).then(() => {
        console.log("Successfully sent the message!");
        //resolve();
    }, reject);
});

function createEmbed(repo, branch, url, commits, size, report) {
    console.log("Constructing Embed...");
    var latest = commits[0];

    const changes = getChangeLog(commits, size);
    console.log(changes)

    var embed = new discord.MessageEmbed()
                .setColor(16776960)
                .setURL(url)
                .setAuthor(repo, "https://cdn.pvpcraft.cz/u/ceNRlF.png", null)
                .setDescription("<:issueopened:507340024786845706> **Informace o pushu:**\n" +
                    "> Počet commitov: **"+ size +"**\n" +
                    "> Branch: **"+ branch +"**\n" +
                    "> Build: **"+ getStatus(report) +"**\n" +
                    "\n" +
                    ":paperclips: **Commity:**\n" + changes)
                .setTimestamp(Date.parse(latest.timestamp));

    if (report.tests.length > 0) {
        appendTestResults(embed, report);
    }

    return embed;
}

function getChangeLog(commits, size) {
    let changelog = "";

    for (const i in commits) {
        if (i > 3) {
            changelog += `> + **${size - i}** dalších...\n`;
            break;
        }

        const commit = commits[i];
        const sha = commit.id.substring(0, 6);
        const message = commit.message.length > MAX_MESSAGE_LENGTH ? (commit.message.substring(0, MAX_MESSAGE_LENGTH) + "...") : commit.message;
        changelog += `> **•** ${message} (@${commit.author.username}) [\`${sha}\`](${commit.url})\n`;
    }

    return changelog;
}

function getStatus(report) {
    if (report.status === "FAILURE") {
        return "Neúspešný";
    }

    if (report.tests.length > 0) {
        var skipped = 0;
        var failures = 0;

        for (var i in report.tests) {
            var status = report.tests[i].status;
            if (status === "SKIPPED") skipped++;
            if (status === "FAILURE" || status === "ERROR") failures++;
        }

        if (failures > 0) {
            return "Neúspešný";
        }
        if (skipped > 0) {
            return "Preskočený";
        }

        return "Úspešný";
    } else {
        return "Úspešný";
    }
}

function appendTestResults(embed, report) {
    var title = false;
    var passes = 0;
    var skipped = 0;
    var failures = [];

    for (var i in report.tests) {
        var status = report.tests[i].status;
        if (status === "OK") passes++;
        else if (status === "SKIPPED") skipped++;
        else failures.push(report.tests[i].name);
    }

    var tests = "";

    if (passes > 0) {
        tests += ` :green_circle: ${passes} Tests passed`;
    }

    if (skipped > 0) {
        tests += ` :yellow_circle: ${skipped} Tests were skipped`;
    }

    if (failures.length > 0) {
        tests += ` :red_circle: ${failures.length} Tests failed\n`;

        for (var i in failures) {
            if (i > 2) {
                tests += `\n+ ${failures.length - i} more...`;
                break;
            }

            tests += `\n${parseInt(i) + 1}. \`${failures[i]}\``;
        }
    }

    embed.addField("Unit Tests" + (failures.length > 0 ? "": ` (~${report.coverage}% coverage):`), tests);
    embed.setFooter(`Finished in ${report.time}s`);
}
