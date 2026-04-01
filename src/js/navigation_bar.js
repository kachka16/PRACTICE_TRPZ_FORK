const currentLang = document.getElementById('current-lang');
const langList = document.getElementById('lang-list');

const translations = {
        ENG:{
            nameuser:"Guest",
            emailuser: "Not logged in",
            maintext: "MAIN",
            archivetext: "Archive",
            settingtext: "SETTING",
            settinguser: "Setting",
            darktheme: "Dark Mode",
            lighttheme: "Light Mode",
            accounttext: "ACCOUNT",
            aboutuser: "About",
            exituser: "Exit",
            addtask: "Adding a task",
            savetask: "Save",
            canceltask: "Cancel",
            archivetask:"Archive",
            edittask: "Edit",
            untitled: "Untitled Task",
            nocontent: "No content"
        },
        UA:{
            nameuser:"Гість",
            emailuser: "Незареєстрований",
            maintext: "ГОЛОВНА",
            archivetext: "Архів",
            settingtext: "НАЛАШТУВАННЯ",
            settinguser: "Налаштування",
            darktheme: "Темна тема",
            lighttheme: "Світла тема",
            accounttext: "АККАУНТ",
            aboutuser: "Про нас",
            exituser: "Вихід",
            addtask: "Додати завдання",
            savetask: "Зберегти",
            canceltask: "Скасувати",
            archivetask:"Архівувати",
            edittask: "Редагувати",
            untitled: "Без назви",
            nocontent: "Нічого немає"
        }
};

const languageSelecter= document.querySelector("select");

function deleteLang(selectedLang) {
    langList.querySelectorAll('li').forEach(li => {
        li.style.display = li.dataset.lang === selectedLang ? 'none' : 'block';
    });
}

deleteLang('ENG');

function applyLang(langCode) {
    const lang = translations[langCode];
    if (!lang) return;
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (lang[key]) el.innerText = lang[key];
    });
}

applyLang('ENG'); 

const savedLang = localStorage.getItem('lang') || 'ENG';
applyLang(savedLang);
deleteLang(savedLang);

if (savedLang === 'UA') {
    currentLang.innerHTML = `<img src="img/ua_flag.png" class="icon-flag"> UA`;
} else {
    currentLang.innerHTML = `<img src="img/usa_flag.png" class="icon-flag"> ENG`;
}


currentLang.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    langList.style.display = langList.style.display === 'block' ? 'none' : 'block';
});

langList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', (e) => {
        e.stopPropagation();
        const lang = li.dataset.lang;
        const src = li.dataset.src;
        currentLang.innerHTML = `<img src="${src}" class="icon-flag"> ${lang}`;
        langList.style.display = 'none';
        deleteLang(lang);
        applyLang(lang); 
        localStorage.setItem('lang', lang);
    });
});
 document.addEventListener('click', (e) => {
    if (!currentLang.contains(e.target) && !langList.contains(e.target)) {
        langList.style.display = 'none';
    }
});



$(".menu > ul > li").click(function (e) {
    $(this).siblings().removeClass("active");
    $(this).toggleClass("active");
    $(this).find("ul").slideToggle();
    $(this).siblings().find("ul").slideUp();
    $(this).siblings().find("ul").find("li").removeClass("active");
});

$(".menu-btn").click(function (){
    $(".left-panel").toggleClass("active");
});
