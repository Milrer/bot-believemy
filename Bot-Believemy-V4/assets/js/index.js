let members = [
    {
        id: 1,
        name: "LuckyFox",
        picture: "assets/img/profils/luckyfox.png",
        twitter: "https://twitter.com/1ucky_F0x",
        github: "https://github.com/LuckyFox31"
    },
    {
        id: 2,
        name: "Louis-Nicolas Leuillet",
        picture: "assets/img/profils/louisnicolas-leuillet.jpg",
        twitter: "https://twitter.com/lnleuillet",
        github: "https://github.com/Milrer"
    },
    {
        id: 3,
        name: "Jean-Brice Mau",
        picture: "assets/img/profils/jeanbrice-maudire.jpg",
        twitter: "https://www.instagram.com/stlckyboy",
        github: "https://github.com/jeanbricemau"
    },
    {
        id: 4,
        name: "Fortanza",
        picture: "assets/img/profils/fortanza.jpg",
        twitter: "https://twitter.com/Fortanza2",
        github: "https://github.com/fortanza%3E"
    },
    {
        id: 5,
        name: "Clément PONS",
        picture: "assets/img/profils/clement-pont.jpg",
        twitter: "https://twitter.com/clement_pons",
        github: "https://github.com/C-PONS-DEV"
    },
    {
        id: 6,
        name: "Yeun Le Floch",
        picture: "assets/img/profils/yeunlf.jpg",
        twitter: false,
        github: "https://github.com/Yeun22%22%3E"
    },
    {
        id: 7,
        name: "Julie Desvaux",
        picture: "assets/img/profils/julie-desvaux.jpg",
        twitter: false,
        github: "https://github.com/julie-desvaux"
    },
    {
        id: 8,
        name: "K.random",
        picture: "assets/img/profils/krandom.jpg",
        twitter: "PAS DE TWITTER",
        github: "https://github.com/Justin-monteilhet"
    },
    {
        id: 9,
        name: "Pseudo_Illyes",
        picture: "assets/img/profils/pseudo-Illyes.jpg",
        twitter: "https://twitter.com/Pseudo_Illyes",
        github: "https://github.com/PseudoIllyes"
    },
    {
        id: 10,
        name: "Hell's Wolf",
        picture: "assets/img/profils/hells-wolf.jpg",
        twitter: "https://twitter.com/HellsWolf1",
        github: "https://github.com/Hellswolf"
    },
    {
        id: 11,
        name: "Sckyzo'Pat",
        picture: "assets/img/profils/sckyzo-pat.jpg",
        twitter: false,
        github: "https://github.com/MariannePiquetNowak"
    },
];

const team = document.querySelector("#team-pictures");

function createMembers(index){
    let card = document.createElement("div"); // creation d'une div
        card.className = "team-card"; // ajout de la classe "team-card"
        team.append(card); // apparition de la div

        let picture = document.createElement("img"); // creation d'un element img
        picture.src = members[index].picture; // va prendre l'image correspondante à l'ID en cours
        picture.className = "profiles-pictures"; // ajout de la classe "profiles-pictures"
        picture.draggable = false; // draggable="false"
        card.append(picture); // apparition de la photo de profil dans card

        let name = document.createElement("h4"); // creation d'un element h4
        name.textContent = members[index].name; // va prendre le nom correspondant à l'ID en cours
        card.append(name); // apparition du nom dans la card

        let buttons = document.createElement("div"); // creation d'une div
        buttons.className = "team-buttons"; // ajout de la classe "team-buttons"
        card.append(buttons); // apparition de la div "team-buttons"

        if(members[index].twitter != false){
            let twitter = document.createElement("a"); // creation d'un element a
            twitter.href = members[index].twitter; // va prendre l'url du compte twitter à l'ID en cours
            twitter.target = "_blank"; // target="_blank"
            buttons.append(twitter); // apparition du bouton twitter

            let twitterImage = document.createElement("img"); // creation d'un element img
            twitterImage.src = "assets/img/twitter-logo.svg"; // va prendre l'image du bouton twitter
            twitterImage.alt = "Twitter"; // ajoute un alt à l'image
            twitterImage.draggable = false; // draggable="false"
            twitter.append(twitterImage); // apparition de l'image dans le bouton twitter
        }

        if(members[index].github != false){
            let github = document.createElement("a"); // creation d'un element a
            github.href = members[index].github; // va prendre l'url du compte github à l'ID en cours
            github.target = "_blank"; // target="_blank"
            buttons.append(github); // apparition du bouton github

            let githubImage = document.createElement("img"); // creation d'un element img
            githubImage.src = "assets/img/github-logo.svg"; // va prendre l'image du bouton github
            githubImage.alt = "GitHub"; // ajoute un alt à l'image
            githubImage.draggable = false; // draggable="false"
            github.append(githubImage); // apparition de l'image dans le bouton github
        }
}

function randomize(array) {
    let i;
    let j;
    let temp;
    for (i = array.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    for (let index = 0; index < members.length; index++) {
        createMembers(index);
        
    }
}

members = randomize(members);