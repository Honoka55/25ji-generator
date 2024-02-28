const i18n = {
    data: {
        'zh-hans': {
            'title': '25点，logo生成器见。',
            'header': '点，lo󰁧o生成器见。',
            'transparent-background': '透明背景',
            'background-color': '背景色：',
            'submit-btn': '生成',
            'submit-btn-update': '更新',
            'download-btn': '保存'
        },
        'zh-hant': {
            'title': '25點，logo產生器見。',
            'header': '點，lo󰁧o產生器見。',
            'transparent-background': '透明背景',
            'background-color': '背景色：',
            'submit-btn': '產生',
            'submit-btn-update': '更新',
            'download-btn': '儲存'
        },
        'ja': {
            'title': '25時、ロゴジェネレーターで。',
            'header': '時、ロゴジェネレーターで。',
            'transparent-background': '透明背景',
            'background-color': '背景色：',
            'submit-btn': '作成',
            'submit-btn-update': '更新',
            'download-btn': '保存'
        },
        'ko': {
            'title': '25시, 로고 제너레이터에서.',
            'header': '시, 로고 제너레이터에서.',
            'transparent-background': '투명 배경',
            'background-color': '배경색:',
            'submit-btn': '작성',
            'submit-btn-update': '경신',
            'download-btn': '저장'
        }
    },
    currentLanguage: '',
    setLanguage(language) {
        document.querySelector('html').setAttribute('lang', language);
        this.currentLanguage = language;
        let elements = document.querySelectorAll('[data-i18n]');
        elements.forEach((element) => {
            let key = element.getAttribute('data-i18n');
            element.textContent = this.getText(key);
        });
    },
    getText(key) {
        return this.data[this.currentLanguage][key];
    },
    detectLanguage() {
        let language = navigator.language;
        if (!this.data[language]) {
            language = 'zh-hans';
        }
        document.getElementById('language').value = language;
        this.setLanguage(language);
    }
};

const languageSelect = document.getElementById('language');
languageSelect.addEventListener('change', () => {
    i18n.setLanguage(languageSelect.value);
});

i18n.detectLanguage();
