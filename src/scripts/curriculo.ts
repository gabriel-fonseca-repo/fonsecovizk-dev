import { JSDOM } from "jsdom";

function scopeCSS(css: string, scope: string) {
    // Regex para encontrar seletores CSS, incluindo seletores complexos
    return css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (_, selectors, brace) => {
        // Dividir os seletores e adicionar o escopo
        let scopedSelectors = selectors
            .split(",")
            .map((selector: string) => {
                // Ignorar seletores @media, @keyframes, etc.
                if (selector.trim().startsWith("@")) {
                    return selector;
                }
                return `${scope} ${selector.trim()}`;
            })
            .join(", ");

        return `${scopedSelectors} ${brace}`;
    });
}

function replaceNbspWithHyphen(html: string) {
    return html.replace(/((&nbsp;)\s*)+/g, "	");
}

function applyDocumentCss(cssText: string, document: Document) {
    let scopedCSS = scopeCSS(cssText, "#iframe-container");
    let newStyle = document.createElement("style");
    newStyle.innerHTML = scopedCSS;
    document.querySelector("div.doc-content")?.appendChild(newStyle);
}

function jsDomParser(data: string): Document {
    return new JSDOM(data).window.document;
}

function vanillaDomParser(data: string): Document {
    let parser = new DOMParser();
    return parser.parseFromString(data, "text/html");
}

function removeAllScriptTags(document: Document) {
    let scripts = document.querySelectorAll("script");
    scripts.forEach((script) => script.remove());
}

export default async function loadCurriculo(isClientSide: boolean = false) {
    return await fetch("https://docs.google.com/document/d/e/2PACX-1vS848j638bes4_jiRfYAudSJrOXfiO4IoSWme2SGncZJVjfqcERay6RrdQNuPBHwO1JPIB43vEzNmiA/pub?embedded=true")
        .then(async (response) => await response.text())
        .then((data) => {
            const dom = isClientSide ? vanillaDomParser(data) : jsDomParser(data);

            // Copiar os estilos do documento original para o principal, escopando-os
            let styleSheets = dom.querySelectorAll('style, link[rel="stylesheet"]');
            styleSheets.forEach((styleSheet: HTMLLinkElement) => {
                if (styleSheet.tagName.toLowerCase() === "style") {
                    applyDocumentCss(styleSheet.innerHTML, dom);
                } else if (styleSheet.tagName.toLowerCase() === "link") {
                    fetch(styleSheet.href)
                        .then((response) => response.text())
                        .then((cssText) => applyDocumentCss(cssText, dom));
                }
            });

            // Remover todos os scripts do documento
            removeAllScriptTags(dom);

            // Substituir &nbsp; por hífen
            let updatedHTML = replaceNbspWithHyphen(dom.body.innerHTML);

            // Make all anchors have a target of _blank
            updatedHTML = updatedHTML.replace(/<a /g, '<a target="_blank" ');

            // Inserir o conteúdo HTML alterado no corpo da página
            return {htmlCurriculo: updatedHTML, error: false};
        })
        .catch((error) => {
            console.error("Erro ao carregar o documento:", error);
            return {htmlCurriculo: null, error: true};
        });
}