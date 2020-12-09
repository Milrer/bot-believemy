// Tableau de Membres
let users = [
  [
    "Louis-Nicolas Leuillet",
    "style/Profile/louisnicolasLeuillet.jpg",
    "https://github.com/Milrer",
    "fab fa-github",
    "https://twitter.com/lnleuillet",
    "fab fa-twitter",
  ],
  [
    "Jean-Brice Mau",
    "style/Profile/jeanbriceMaudire.jpg",
    "https://github.com/jeanbricemau",
    "fab fa-github",
    "https://www.instagram.com/stlckyboy/",
    "fab fa-instagram",
  ],
  [
    "LuckyFox",
    "style/Profile/luckyfox.png",
    "https://github.com/LuckyFox31",
    "fab fa-github",
    "https://twitter.com/1ucky_F0x",
    "fab fa-twitter",
  ],
  [
    "Fortanza",
    "style/Profile/fortanza.jpg",
    "https://github.com/fortanza%3E",
    "fab fa-github",
    "https://www.linkedin.com/in/cedric-rene-jean-lasalle-b783891bb",
    "fab fa-linkedin",
  ],
  [
    "Clément PONS",
    "style/Profile/clementPONS.jpg",
    "https://github.com/C-PONS-DEV",
    "fab fa-github",
    "https://twitter.com/clement_pons",
    "fab fa-twitter",
  ],
  [
    "Julie Desvaux",
    "style/Profile/julie_desvaux.jpg",
    "https://github.com/julie-desvaux",
    "fab fa-github",
    "https://www.linkedin.com/in/julie-desvaux/",
    "fab fa-linkedin",
  ],
  [
    "Yeun LE FLOCH",
    "style/Profile/yeunLF.jpg",
    "https://github.com/Yeun22%22%3E",
    "fab fa-github",
    "https://www.linkedin.com/in/yeun-le-floch-2327a6167/%22%3E",
    "fab fa-linkedin",
  ],
  [
    "K.random",
    "style/Profile/K.random.png",
    "https://github.com/Justin-monteilhet",
    "fab fa-github",
    "https://steamcommunity.com/profiles/76561198007363510",
    "fab fa-steam",
  ],
  [
    "Pseudo_Illyes",
    "style/Profile/Pseudo_Illyes.png",
    "https://github.com/PseudoIllyes",
    "fab fa-github",
    "https://twitter.com/Pseudo_Illyes",
    "fab fa-twitter",
  ],
  [
    "Hell's Wolf",
    "style/Profile/Hell's Wolf.jpg",
    "https://github.com/Hellswolf",
    "fab fa-github",
    "https://twitter.com/HellsWolf1",
    "fab fa-twitter",
  ],
  [
    "Sckyzo'Pat",
    "style/Profile/Sckyzo'Pat.jpg",
    "https://github.com/MariannePiquetNowak",
    "fab fa-github",
    "https://www.reddit.com/user/Sckyzopat",
    "fab fa-reddit",
  ],
];

// Création des variables 

// Variable li n°0
let image = document.getElementById("image-membre");
let pseudo = document.getElementById("pseudo-membre");
let lien1 = document.getElementById("lien_icon1");
let icone1 = document.querySelector(".icone1");
let lien2 = document.getElementById("lien_icon2");
let icone2 = document.querySelector(".icone2");
// Variable li n°1
let image1 = document.getElementById("image-membre1");
let pseudo1 = document.getElementById("pseudo-membre1");
let lien11 = document.getElementById("lien_icon11");
let icone11 = document.querySelector(".icone11");
let lien21 = document.getElementById("lien_icon21");
let icone21 = document.querySelector(".icone21");
// Variable li n°2
let image2 = document.getElementById("image-membre2");
let pseudo2 = document.getElementById("pseudo-membre2");
let lien12 = document.getElementById("lien_icon12");
let icone12 = document.querySelector(".icone12");
let lien22 = document.getElementById("lien_icon22");
let icone22 = document.querySelector(".icone22");
// Variable li n°3
let image3 = document.getElementById("image-membre3");
let pseudo3 = document.getElementById("pseudo-membre3");
let lien13 = document.getElementById("lien_icon13");
let icone13 = document.querySelector(".icone13");
let lien23 = document.getElementById("lien_icon23");
let icone23 = document.querySelector(".icone23");
// Variable li n°4
let image4 = document.getElementById("image-membre4");
let pseudo4 = document.getElementById("pseudo-membre4");
let lien14 = document.getElementById("lien_icon14");
let icone14 = document.querySelector(".icone14");
let lien24 = document.getElementById("lien_icon24");
let icone24 = document.querySelector(".icone24");
// Variable li n°5
let image5 = document.getElementById("image-membre5");
let pseudo5 = document.getElementById("pseudo-membre5");
let lien15 = document.getElementById("lien_icon15");
let icone15 = document.querySelector(".icone15");
let lien25 = document.getElementById("lien_icon25");
let icone25 = document.querySelector(".icone25");
// Variable li n°6
let image6 = document.getElementById("image-membre6");
let pseudo6 = document.getElementById("pseudo-membre6");
let lien16 = document.getElementById("lien_icon16");
let icone16 = document.querySelector(".icone16");
let lien26 = document.getElementById("lien_icon26");
let icone26 = document.querySelector(".icone26");
// Variable li n°7
let image7 = document.getElementById("image-membre7");
let pseudo7 = document.getElementById("pseudo-membre7");
let lien17 = document.getElementById("lien_icon17");
let icone17 = document.querySelector(".icone17");
let lien27 = document.getElementById("lien_icon27");
let icone27 = document.querySelector(".icone27");

let dernier = 0;
let nombreAleatoire = 0;

// Fonction permettant de générer un nombre aléatoire
const genererNombreEntier = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

//Generation des variables aléatoires
const membre = () => {
  do {
    nombreAleatoire = genererNombreEntier(users.length);
    nombreAleatoire1 = genererNombreEntier(users.length);
    nombreAleatoire2 = genererNombreEntier(users.length);
    nombreAleatoire3 = genererNombreEntier(users.length);
    nombreAleatoire4 = genererNombreEntier(users.length);
    nombreAleatoire5 = genererNombreEntier(users.length);
    nombreAleatoire6 = genererNombreEntier(users.length);
    nombreAleatoire7 = genererNombreEntier(users.length);
  } while (nombreAleatoire == dernier);
  
  // li n°0
  image.setAttribute("src", users[nombreAleatoire][1]);
  pseudo.textContent = users[nombreAleatoire][0];

  lien1.setAttribute("href", users[nombreAleatoire][2]);
  icone1.setAttribute("class", users[nombreAleatoire][3]);

  lien2.setAttribute("href", users[nombreAleatoire][4]);
  icone2.setAttribute("class", users[nombreAleatoire][5]);

  // li n°1
  image1.setAttribute("src", users[nombreAleatoire1][1]);
  pseudo1.textContent = users[nombreAleatoire1][0];

  lien11.setAttribute("href", users[nombreAleatoire1][2]);
  icone11.setAttribute("class", users[nombreAleatoire1][3]);

  lien21.setAttribute("href", users[nombreAleatoire1][4]);
  icone21.setAttribute("class", users[nombreAleatoire1][5]);

  // li n°2
  image2.setAttribute("src", users[nombreAleatoire2][1]);
  pseudo2.textContent = users[nombreAleatoire2][0];

  lien12.setAttribute("href", users[nombreAleatoire2][2]);
  icone12.setAttribute("class", users[nombreAleatoire2][3]);

  lien22.setAttribute("href", users[nombreAleatoire2][4]);
  icone22.setAttribute("class", users[nombreAleatoire2][5]);

  // li n°3
  image3.setAttribute("src", users[nombreAleatoire3][1]);
  pseudo3.textContent = users[nombreAleatoire3][0];

  lien13.setAttribute("href", users[nombreAleatoire3][2]);
  icone13.setAttribute("class", users[nombreAleatoire3][3]);

  lien23.setAttribute("href", users[nombreAleatoire3][4]);
  icone23.setAttribute("class", users[nombreAleatoire3][5]);

  // li n°4
  image4.setAttribute("src", users[nombreAleatoire4][1]);
  pseudo4.textContent = users[nombreAleatoire4][0];

  lien14.setAttribute("href", users[nombreAleatoire4][2]);
  icone14.setAttribute("class", users[nombreAleatoire4][3]);

  lien24.setAttribute("href", users[nombreAleatoire4][4]);
  icone24.setAttribute("class", users[nombreAleatoire4][5]);

  // li n°5
  image5.setAttribute("src", users[nombreAleatoire5][1]);
  pseudo5.textContent = users[nombreAleatoire5][0];

  lien15.setAttribute("href", users[nombreAleatoire5][2]);
  icone15.setAttribute("class", users[nombreAleatoire5][3]);

  lien25.setAttribute("href", users[nombreAleatoire5][4]);
  icone25.setAttribute("class", users[nombreAleatoire5][5]);

  // li n°6
  image6.setAttribute("src", users[nombreAleatoire6][1]);
  pseudo6.textContent = users[nombreAleatoire6][0];

  lien16.setAttribute("href", users[nombreAleatoire6][2]);
  icone16.setAttribute("class", users[nombreAleatoire6][3]);

  lien26.setAttribute("href", users[nombreAleatoire6][4]);
  icone26.setAttribute("class", users[nombreAleatoire6][5]);

  // li n°7
  image7.setAttribute("src", users[nombreAleatoire7][1]);
  pseudo7.textContent = users[nombreAleatoire7][0];

  lien17.setAttribute("href", users[nombreAleatoire7][2]);
  icone17.setAttribute("class", users[nombreAleatoire7][3]);

  lien27.setAttribute("href", users[nombreAleatoire7][4]);
  icone27.setAttribute("class", users[nombreAleatoire7][5]);

  dernier = nombreAleatoire;
};

membre();

window.setInterval(membre, 3000);


