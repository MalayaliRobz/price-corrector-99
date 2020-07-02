import { roundNumber } from "../utils/rounder.js";
import { setTooltipOnElement } from "../utils/tooltip.js"

const config = {
  'amazon.in': {
    findNumberDoms: (rootElement, differenceLimit) => {
      let numberFormating = new Intl.NumberFormat('en-IN');
      let domElements = rootElement.querySelectorAll && rootElement.querySelectorAll("[class*='price'],[id*='price']");
      domElements = domElements || [];

      domElements.forEach(element => {
        let textNode;
        let walk=document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);

        while(textNode=walk.nextNode()) {
          let numberString = (textNode.wholeText || '').trim().replace(/[^\.\d\s]/g, "");
          numberString = (numberString.match(/\d+(?:\d*[\.,]?\d*)*\d*/) || [])[0];
          if(numberString 
              &&!!parseFloat(numberString) 
              && !isNaN(numberString)
              && !textNode.wholeText.includes("%")) {
            let textContent = textNode.parentElement.textContent;
            let newValue = roundNumber(numberString, differenceLimit);
    
            if (parseFloat(numberString) !== parseFloat(newValue)) {
              let parentElement = textNode.parentElement;
              parentElement.innerHTML = parentElement.innerHTML.replace(/\d+(?:\d*[\.,]?\d*)*\d*/, numberFormating.format(newValue));
    
              setTooltipOnElement(parentElement, textContent);

              break;
            }
          }
        }
      });
    }
  },
  'amazon.com': {
    findNumberDoms: (rootElement, differenceLimit) => {
      let numberFormating = new Intl.NumberFormat('en-US');
      walkDOM(rootElement, (node) => {
        if (node.textContent.includes("$")) {
          let numberString = node.textContent.trim().replace(/[^\.\d\s]/g, "");

          if(numberString && !!parseFloat(numberString) && !isNaN(numberString)) {
              let textContent = node.textContent;
              let newValue = roundNumber(numberString, differenceLimit);

              if (parseFloat(numberString) !== parseFloat(newValue)) {
                updateSitePriceDom('amazon.com', node, numberFormating.format(newValue));
                setTooltipOnElement(node, textContent);
              }
            }
        }
      });
    },
    updatePriceDom: (node, priceValue) => {
      let textMatch = node.textContent.replace(/[^\.\d\s,]/g, "").trim();
      if (node.innerHTML.includes(textMatch)) {
        node.innerHTML = node.innerHTML.replace(textMatch, priceValue);
      } else {
        let priceTextNode = node.querySelector('.a-price-whole');
        priceTextNode = !priceTextNode ? (node.querySelector('ppnn') || {}).parentElement : priceTextNode;
        let priceFractionTextNode = node.querySelector('.a-price-fraction');
        if (priceTextNode) {
          if (priceTextNode.textContent.includes("$")) {
            priceValue = "$" + priceValue;
          }
          priceTextNode.textContent = priceValue;
          priceFractionTextNode ? priceFractionTextNode.textContent = "00" : '';
        }
      }
    }
  },

  'flipkart': {
    findNumberDoms: (rootElement, differenceLimit) => {
      defaultWalkAndReplace(rootElement, differenceLimit, '₹', new Intl.NumberFormat('en-IN'));
    }
  }
}

const walkDOM = function(node, func) {
  node = node.firstElementChild;
  while(node) {
    let matches = containsNumber(node.textContent);
    if (matches.length > 1) {
      walkDOM(node, func);
    } else if (matches.length === 1) {
      if (node.querySelectorAll('*').length > 1) {
        walkDOM(node, func);
      } else {
        func(node);
      }
    }
    node = node.nextElementSibling;
  }
};

function containsNumber(text) {
  text = text || ""
  return text.match(/\d+(?:\d*[\.,]?\d*)*\d*/g) || []
}

function updateSitePriceDom(siteName, node, priceValue) {
  let fn = (config[siteName] || {}).updatePriceDom;

  if (fn) {
    fn(node, priceValue)
  } else {
    let textMatch = node.textContent.replace(/[^\.\d\s,]/g, "").trim();
    if (node.innerHTML.includes(textMatch)) {
      node.innerHTML = node.innerHTML.replace(textMatch, priceValue);
    }
  }
}

function defaultWalkAndReplace(rootElement, differenceLimit, priceSymbol, numberFormating) {
  walkDOM(rootElement, (node) => {
    if (node.textContent.includes(priceSymbol)) {
      let numberString = node.textContent.trim().replace(/[^\.\d\s]/g, "");

      if(numberString && !!parseFloat(numberString) && !isNaN(numberString)) {
          let textContent = node.textContent;
          let newValue = roundNumber(numberString, differenceLimit);

          if (parseFloat(numberString) !== parseFloat(newValue)) {

            updateSitePriceDom('', node, numberFormating.format(newValue));
            setTooltipOnElement(node, textContent);
          }
        }
    }
  });
}

export default config;