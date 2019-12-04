import React, {useContext, useState, useEffect, useCallback} from 'react';
import styles from './styles.css';

export const TranslationContext = React.createContext({});

const constructKeyWithLanguage = ({language, prefix, k}) => {
    let key = "";

    if(!!language){
        key += language + ".";
    }
    if(!!prefix){
        key += prefix + ".";
    }
    return key + k
};

const constructKey = ({prefix, k}) => (!!prefix ? prefix + "." + k : k);

export const DefaultTranslatorsHint = ({k, language, translate, ...props}) => (
    <div className={styles.TranslatorsHint}>
        Key: {k}; Language: {language}; Translation: {translate(k)}
    </div>
);

export const TranslationProvider = ({fetch, translatorsHint=DefaultTranslatorsHint, defaultPrefix="", defaultLanguage="", children}) => {
    const [translations, setTranslations] = useState({});
    const [isTranslating, setIsTranslating] = useState(true);
    const [language, setLanguage] = useState(defaultLanguage);
    const [languages, setLanguages] = useState([]);
    const [prefix, setPrefix] = useState(defaultPrefix);

    const translate = useCallback((isTranslating && translations[language]
            ? (k) => {
                let string = null;
                if(!!prefix){
                    string = translations[language][prefix + "." + k];

                    if(string){
                        return string;
                    }
                }
                string = translations[language][k];
                return string ? string : constructKeyWithLanguage({language, k, prefix});
            }
            : (k) => {
                return constructKeyWithLanguage({language, k, prefix})
            }
    ), [translations, isTranslating, language, languages, prefix]);

    useEffect(() => {
        let isCancelled = false;

        fetch()
        .then((translationData) => {
            if(!isCancelled){
                setTranslations(translationData);
                setLanguages(Object.keys(translationData));
            }
            else{
                console.log("Already Cancelled this request");
            }
        })
        .catch((error) => {
            console.log("An Error occured while getting translations");
        });

        return () => {isCancelled = true};
    }, [fetch]);

    return <TranslationContext.Provider value={
            {
                translations,
                isTranslating,
                language,
                languages,
                translate,
                setTranslations,
                setIsTranslating,
                setLanguage,
                setPrefix,
                translatorsHint,
            }
        }>
            {children}
    </TranslationContext.Provider>
};

export const useTranslate = () => {
    const context = useContext(TranslationContext);
    return context.translate;
};

export const useTranslation = (k) => {
    const translate = useTranslate();
    return translate(k);
};

export const useLanguage = () => {
    const {language, setLanguage} = useContext(TranslationContext);
    return [language, setLanguage];
};

export const useIsTranslating = () => {
    const {isTranslating, setIsTranslating} = useContext(TranslationContext);
    return [isTranslating, setIsTranslating];
};

export const usePrefix = () => {
    const {prefix, setPrefix} = useContext(TranslationContext);
    return [prefix, setPrefix];
};

const Translate = ({k, ...props}) => {
    const {translate, language, translations, isTranslating, translatorsHint:TranslatorsHint} = useContext(TranslationContext);

    if(!isTranslating && TranslatorsHint){
        return <TranslatorsHint
            k={k}
            language={language}
            translate={translate}
            {...props}
            />
    }
    else{
        return translate(k)
    }
};

export default Translate;
