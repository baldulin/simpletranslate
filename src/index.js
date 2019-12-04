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
        Key: {k};
        Language: {language};
        TranslationString: {translate({k, interpolate:false})}
        Translated: {translate({k, interpolate:true, params:props})}
    </div>
);

export const TranslationProvider = ({fetch, translatorsHint=DefaultTranslatorsHint, defaultPrefix="", defaultLanguage="", children}) => {
    const [translations, setTranslations] = useState({});
    const [isTranslating, setIsTranslating] = useState(true);
    const [language, setLanguage] = useState(defaultLanguage);
    const [languages, setLanguages] = useState([]);
    const [prefix, setPrefix] = useState(defaultPrefix);

    const translate = useCallback((isTranslating && translations[language]
            ? ({k, addLineBreaks=true, doInterpolate=true, params={}}) => {
                let string = null;
                if(!!prefix){
                    string = translations[language][prefix + "." + k];

                    if(string){
                        if(doInterpolate){
                            return interpolate({str: string, addLineBreaks, params});
                        }
                        return string;
                    }
                }
                if(!string){
                    string = translations[language][k];
                }


                if(string){
                    if(doInterpolate){
                        return interpolate({str: string, addLineBreaks, params});
                    }
                    return string;
                }
                return string ? string : constructKeyWithLanguage({language, k, prefix});
            }
            : ({k}) => {
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

function splitAndAddLineBreaks(str){
    let parts = str.split("\n");
    let result = [];

    for(let i=0;i<parts.length-1;i++){
        result.push(parts[i]);
        result.push(<br/>);
    }
    result.push(parts[parts.length-1]);
    return result;
}

const paramRegex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
export const interpolate = ({str, params, addLineBreaks=true}) => {
    let result = [];
    let index = 0;
    let match;
    let part;

    while(true){
        match = paramRegex.exec(str);

        if(!match){
            break;
        }

        if(match.index > index){
            part = str.substring(index, match.index);
            if(addLineBreaks){
                result = result.concat(splitAndAddLineBreaks(part));
            }
            else{
                result.push(part);
            }
        }
        result.push(params[match[1]]);
        index = match.index + match[0].length;
    }

    if(index + 1 < str.length){
        part = str.substring(index);

        if(addLineBreaks){
            result = result.concat(splitAndAddLineBreaks(part));
        }
        else{
            result.push(part);
        }
    }

    return result;
};

const Translate = ({k, addLineBreaks=true, ...props}) => {
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
        return translate({k, params:props, addLineBreaks});
    }
};

export default Translate;
