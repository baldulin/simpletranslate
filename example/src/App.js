import React from 'react'

import Translate, {TranslationProvider, useIsTranslating, useLanguage, usePrefix} from 'simpletranslate'

const getTranslatePromise = (data) => (
    () => new Promise((resolve, reject) => (resolve(data)))
);

const data = {
    de:{
        "test1": "Dies ist der erste Test",
        "prefixed.test1" : "Dies ist ein prefixter Text",
        "test2": "Dies ist der zweite Test",
        "test3": "Dies ist der dritte Test",
    },
    en:{
        "test1": "This is the first test",
        "test2": "This is the second test",
        "test3": "This is the third test",
    },
};

const ChangeLanguage = () => {
    const [language, setLanguage] = useLanguage();
    return <button onClick={() => setLanguage(language === "en" ? "de" : "en")}>
        {language === "en" ? "Deutsch" : "English"}
    </button>
};

const ChangeIsTranslating = () => {
    const [isTranslating, setIsTranslating] = useIsTranslating();

    return <button onClick={() => setIsTranslating(!isTranslating)}>
        {isTranslating ? "Show developing Info" : "Translate"}
    </button>
};

const ChangePrefix = () => {
    const [prefix, setPrefix] = usePrefix();

    return <input type="text" onChange={(ev) => setPrefix(ev.target.value)} value={prefix}/>
};

const App = (props) => (
    <TranslationProvider fetch={getTranslatePromise(data)} defaultLanguage="en" defaultPrefix="">
        <ul>
            <li><Translate k="test1"/></li>
            <li><Translate k="test2"/></li>
            <li><Translate k="test3"/></li>
        </ul>
        <ChangeLanguage/>
        <ChangeIsTranslating/>
        <ChangePrefix/>
    </TranslationProvider>
);

export default App;
