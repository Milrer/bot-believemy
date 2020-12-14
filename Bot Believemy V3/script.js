const members = [
  {
    name: "Louis-Nicolas Leuillet", 
    image: "style/Profile/louisnicolasLeuillet.jpg",
    link_one: "https://github.com/Milrer",
    link_two: "'https://twitter.com/lnleuillet",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-twitter",
  },
  {
    name: "Jean-Brice Mau", 
    image: "style/Profile/jeanbriceMaudire.jpg",
    link_one: "https://github.com/jeanbricemau",
    link_two: "https://www.instagram.com/stlckyboy/",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-instagram",
  }, 
  {
    name: "LuckyFox", 
    image: "style/Profile/luckyfox.png",
    link_one: "https://github.com/LuckyFox31",
    link_two: "https://twitter.com/1ucky_F0x",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-twitter",
  },
  {
    name: "Fortanza", 
    image: "style/Profile/fortanza.jpg",
    link_one: "https://github.com/fortanza%3E",
    link_two: "https://www.linkedin.com/in/cedric-rene-jean-lasalle-b783891bb",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-linkedin",
  },
  {
    name: "Clément PONS", 
    image: "style/Profile/clementPONS.jpg",
    link_one: "https://github.com/C-PONS-DEV",
    link_two: "https://twitter.com/clement_pons",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-twitter",
  },
  {
    name: "Yeun LE FLOCH", 
    image: "style/Profile/yeunLF.jpg",
    link_one: "https://github.com/Yeun22%22%3E",
    link_two: "https://www.linkedin.com/in/yeun-le-floch-2327a6167/%22%3E",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-linkedin",
  },
  {
    name: "Julie Desvaux", 
    image: "style/Profile/julie_desvaux.jpg",
    link_one: "https://github.com/julie-desvaux",
    link_two: "https://www.linkedin.com/in/julie-desvaux/",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-linkedin",
  },
  {
    name: "K.random", 
    image: "style/Profile/K.random.png",
    link_one: "https://github.com/Justin-monteilhet",
    link_two: "https://steamcommunity.com/profiles/76561198007363510",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-steam",
  },
  {
    name: "Pseudo_Illyes", 
    image: "style/Profile/Pseudo_Illyes.png",
    link_one: "https://github.com/PseudoIllyes",
    link_two: "https://twitter.com/Pseudo_Illyes",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-twitter",
  },
  {
    name: "Hell's Wolf", 
    image: "style/Profile/Hell's Wolf.jpg",
    link_one: "https://github.com/Hellswolf",
    link_two: "https://twitter.com/HellsWolf1",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-twitter",
  },
  {
    name: "Sckyzo'Pat", 
    image: "style/Profile/Sckyzo'Pat.jpg",
    link_one: "https://github.com/MariannePiquetNowak",
    link_two: "https://www.linkedin.com/in/marianne-piquet-nowak/",
    fab_link_one: "fab fa-github",
    fab_link_two: "fab fa-linkedin",
   },
];


const ul = document.getElementById('team_members');

const createMembers = () => {
  const randomMembers = members[Math.floor(Math.random() * members.length)]; 
  
  // Création de notre li
  let li = document.createElement('li'); 
  li.className = "team_member"
  ul.append(li); 
  
  // Creation de <img>
  let image = document.createElement('img');
  image.src = randomMembers.image;
  // Création du <h2>
  let name = document.createElement('h2');
  name.textContent = randomMembers.name; 
  // Création de la <div class="member_links">
  let member_links = document.createElement('div');
  member_links.className = "member_links"; 
  // Jointure des éléments <img>, <h2> et <div> à <li>
  li.append(image, name, member_links);
  
  // Création des lien dans <div class="member_links">
  // Creation des balises <a>
  let link_one = document.createElement('a');
  link_one.href = randomMembers.link_one;
  let link_two = document.createElement('a');
  link_two.href = randomMembers.link_two;
  // Creation des balises <i>
  let fab_one = document.createElement('i');
  let fab_two = document.createElement('i');
  fab_one.className = randomMembers.fab_link_one;  
  fab_two.className = randomMembers.fab_link_two;
  
  // jointure des <i> sur les <a>
  link_one.append(fab_one);
  link_two.append(fab_two);
  // Jointure des <a> dans la <div class="member_links">
  member_links.append(link_one, link_two)

}

 if(ul) {
   for(let i = 0; i <= 7; i++){
     createMembers(); 
   }
 } 

/*
1) Optimisation future : faire en sorte que les élements ne se double pas dans la liste 
  - ajouter un id unique à chaque membres et y appliquer une condition ?

2) Gérer le setInterval car rentre en conflit avec la boucle for (création de boucle infinie) 
window.setInterval(createMembers, 1000);

3) Concernant le css, principalement les images : faire un background-image plutôt que d'utiliser le src, avec un cover 
Côté JS, utilisé la props .style.backgroundImage = randomMembers.image

*/
