const { Client, Intents, MessageEmbed, Attachment } = require('discord.js');
const fs = require('fs');
const CronJob = require('cron').CronJob;
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


function buildEmbed(arr){
    var fields = "";
    arr.forEach((e,i) => {
        fields += (i+1) + ' - [' + e + '](https://www.macmillandictionary.com/dictionary/british/' + e + ')' + '\n\n';
    });
    return new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Voici vos mots du jour, bonne révision!')
        .setURL('https://github.com/ChrisVerschelden')
        .setDescription(fields)
}

function parseAndShuffle(){
    var tmp = []
    fs.readFile('listeMot.txt', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            tmp = data.split('/');
            var tmp_shuffled = shuffle(tmp);
            fs.writeFileSync('listeShuffled.json',JSON.stringify(tmp_shuffled),{encoding:'utf8',flag:'w'})
        }
    });
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

function displayAndRemove(){
    var tmp = []
    fs.readFile('listeShuffledNotUsed.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
            var words_array = JSON.parse(data);
            var array_of_the_day = words_array.splice(0, 10);
            fs.readFile('channels.json', 'utf8', function readFileCallback(err, data){
                if (err){
                    console.log(err);
                } else {
                    var liste_channels = JSON.parse(data);
                    var daily_embed = buildEmbed(array_of_the_day);
                    Object.entries(liste_channels).forEach(([key, value]) => {
                        client.channels.cache.find(channel => channel.id === key).send({embeds:[daily_embed]});
                    });
                }
            });
            fs.writeFileSync('listeShuffledNotUsed.json',JSON.stringify(words_array),{encoding:'utf8',flag:'w'});
        }
    });
}

var job = new CronJob('0 0 8 * * *', e => {
    displayAndRemove();
}, null, true, 'Europe/Paris');
job.start(); 

client.once('ready', () => {
    console.log('bot ready');
});

client.on("messageCreate", message => {
    if(message.content === "!addChannel" && message.author.id === '297857268580614164'){
        fs.readFile('channels.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
                var liste_channels = JSON.parse(data);
                if( !( message.channel.id in liste_channels ) ){
                    liste_channels[message.channel.id] = true;
                    fs.writeFileSync('channels.json',JSON.stringify(liste_channels),{encoding:'utf8',flag:'w'})
                    var example_embed = buildEmbed(["atmosphere","discrimination","launch","thing","electricity","in","cycle","farmer","ongoing","writing"]);
                    message.reply('le channel ' + message.channel.name + ' a bien été abonnés, vous recevrez chaque jours à 8h une liste de 10 mots parmis les 3000 plus utilisés en anglais sous la forme suivante :');
                    message.channel.send({embeds: [example_embed]});
                }
            }
        });
    }
})

client.login(process.env.TOKEN);