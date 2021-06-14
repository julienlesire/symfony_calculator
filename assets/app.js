/*
 * Welcome to your app's main JavaScript file!
 *
 * We recommend including the built version of this JavaScript file
 * (and its CSS file) in your base layout (base.html.twig).
 */

// imports Tailwind
import "tailwindcss/tailwind.css";
// any CSS you import will output into a single css file (app.css in this case)
import './styles/app.css';

import ReactDOM from 'react-dom';
import React, { useState, useEffect, useMemo } from 'react';

const operatorEncode = operator => {
    switch (operator) {
        case "/":
            return "÷";
        case "*":
            return "×";
        case "+":
        case "-":
            return operator;
    }
};

const toPrintableExpression = expression => {
    expression = String(expression || 0);

    return expression && expression.length
        ? expression.replace(/ *([/*-+]) */, (_, operator) => {
            operator = operatorEncode(operator);
            return operator && ` ${operator} `;
        })
        : 0;
};

const loading = (
    <svg className="calculator__loading" version="1.1" xmlns="http://www.w3.org/2000/svg"
    width="60px" height="10px" viewBox="0 0 80 20">
    <circle cx="10" cy="10" r="10" fill="#666" >
        <animate attributeName="cx" from="10" to="40" dur="0.5s" calcMode="spline" keySplines="0.42 0 0.58 1" keyTimes="0;1" repeatCount="indefinite" />
    </circle>
    <circle cx="10" cy="10" r="0" fill="#555">
        <animate attributeName="r" from="0" to="10" dur="0.5s" calcMode="spline" keySplines="0.42 0 0.58 1" keyTimes="0;1" repeatCount="indefinite" />
    </circle>
    <circle cx="40" cy="10" r="10" fill="#777">
        <animate attributeName="cx" from="40" to="70" dur="0.5s" calcMode="spline" keySplines="0.42 0 0.58 1" keyTimes="0;1" repeatCount="indefinite" />
    </circle>
    <circle cx="70" cy="10" r="10" fill="#666">
        <animate attributeName="r" from="10" to="0" dur="0.5s" calcMode="spline" keySplines="0.42 0 0.58 1" keyTimes="0;1" repeatCount="indefinite" />
    </circle>
    </svg>
);

const CALCULATION_STATE_TYPING = false;
const CALCULATION_STATE_FETCHING = true;

/**
 * Represents a Google caclulator component
 */
function Calculator() {
    // the expression entered by the user
    const [ expression, setExpression ] = useState();
    // the result returned by the server
    const [ result, setResult ] = useState();
    // the cache size limit
    const cacheLimit = 20;
    // a cache for the server results
    const [ stateCache, setStateCache ] = useState([]);
    // the current calculation state
    const [ calculationState, setCalculationState ] = useState(CALCULATION_STATE_TYPING);
    // the previous answer after the user has clicked "AC"
    const [ answer, setAnswer ] = useState();
    // the history menu visibility
    const [ menuVisibility, setMenuVisibility ] = useState(false);

    /**
     * Adds a value to the cache
     * @param {string} expression the expression calculated
     * @param {string} res the calculation result
     * @returns {string} res
    */
    const putInCache = (expression, res) => {
        // prevents the cache to grow
        if (stateCache.length === cacheLimit) {
            stateCache.shift();
        }

        // adds the entry
        stateCache.push(
            [ expression, res ]
        );

        // sets
        setStateCache(stateCache);
        return res;
    };

    /**
     * Retrieves a value in cache
     * @param {string} expression
     * @returns {?string}
    */
    const getFromCache = expression => {
        const res = stateCache.find(
            entry => expression === entry[0]
        );

        return res && res[1];
    };

    // subscribes to document keydown
    useEffect(() => {
        if (document && document.addEventListener) {
            document.addEventListener(
                'keydown', keyDown
            );

            return () => document.removeEventListener(
                'keydown', keyDown
            );
        }
    });

    // when the calculation state changes
    useEffect(async () => {
        switch (calculationState) {
            case CALCULATION_STATE_FETCHING:
                const cached = getFromCache(result);

                const promise = cached
                    ? Promise.resolve(cached)
                    : calculateExpression(result).then(
                        res => putInCache(result, res)
                    );

                promise.then(
                    res => {
                        setExpression(result);
                        setResult(res);
                    }
                ).finally(
                    () => setCalculationState(CALCULATION_STATE_TYPING)
                );
                break;
        }
    }, [ calculationState ]);

    /**
     * @returns {?string}
    */
    const getLastCharacter = str => {
        const strLength = str && str.length || 0;

        if (strLength) {
            return str[strLength - 1];
        }
    };

    /**
     * Calculates an expression result
     * @param {string} expression The expression to calculate
     * @returns {Promise}
    */
    const calculateExpression = async expression => {
        if (!(expression && expression.length)) {
            return Promise.reject();
        }

        const expressionLastCharacter = getLastCharacter(expression);

        if (
            "." === expressionLastCharacter
            || isOperator(expressionLastCharacter)
        ) {
            return Promise.reject();
        }

        if (isNumber(expression)) {
            return Promise.resolve(expression);
        }

        const data = new FormData();
        data.set("expression", expression);

        // then fetch the server
        const response = await fetch('/calculate', {
            method: 'POST',
            body: data
        });

        // then parse the response to JSON
        const json = await response.json();

        return null == json.result
            ? Promise.reject()
            : Promise.resolve(json.result);
    };

    const isNumber = character => !isNaN(Number(character));

    const isOperator = character => {
        switch (character) {
            case "÷":
            case "×":
            case "+":
            case "-":
                return true;
            default:
                return false;
        }
    }

    const appendAllowed = (expression, character) => {
        if (isNumber(character)) {
            return true;
        }

        const expressionLength = expression
            ? expression.length
            : 0;

        const expressionLastCharacter = expressionLength
            ? expression.charAt(expressionLength - 1)
            : null;

        switch (character) {
            case ".":
                return isNumber(expressionLastCharacter);

            default:
                return !isOperator(expressionLastCharacter);
        }
    }

    const append = character => () => setResult(
        expression => {
            if (!expression && "." === character) {
                return "0.";
            }

            return appendAllowed(expression, character)
                ? `${expression || ""}${character}`
                : expression;
        }
    );

    const appendSelf = e => append(e.target.innerHTML)();

    const reset = result => {
        setCalculationState(CALCULATION_STATE_TYPING);

        if (isNumber(result)) {
            setAnswer(result);
        }

        setResult(0);
    };

    const keyDown = e => {
        const key = e.key;

        if (isOperator(key)) {
            return append(operatorEncode(key))();
        }

        switch (key) {
            case "Enter":
                return setCalculationState(CALCULATION_STATE_FETCHING);

            case "Backspace":
                return setResult(
                    expression => {
                        const expressionLength = expression
                            ? expression.length
                            : 0;

                        return expressionLength
                            ? expression.substring(0, expressionLength - 1)
                            : expression;
                    }
                );

            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                return append(key)();
        }
    };

    return (
        <div className="calculator__main" onClick={ () => setMenuVisibility(false) }>
            <div className="calculator__screen">
                <button className="calculator__history" onClick={
                    e => {
                        e.stopPropagation();
                        setMenuVisibility(visible => !visible);
                    }
                }>
                    <svg className="calculator__history_icon" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path></svg>
                </button>

                <div className="calculator__expression">
                    <div className="calculator__expression_expression">
                        {
                            answer
                                ? "Ans"
                                : expression && toPrintableExpression(expression)
                        }
                    </div>
                    <div className="calculator__expression_answer">
                        { answer }
                    </div>
                </div>

                <CalculatorMenu
                    cache={ stateCache }
                    visible={ menuVisibility }
                    setResult={
                        res => {
                            setResult(res);
                            setMenuVisibility(false);
                        }
                    } />

                <div className="calculator__result">
                    {
                        CALCULATION_STATE_FETCHING === calculationState
                            ? loading
                            : toPrintableExpression(result)
                    }
                </div>
            </div>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    7
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    8
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    9
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ append("/") }>
                    ÷
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    4
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    5
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    6
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ append("*") }>
                    ×
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    1
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    2
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    3
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    -
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    0
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    .
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                className="calculator__equals"
                onClick={ () => setCalculationState(CALCULATION_STATE_FETCHING) }>
                    =
            </CalculatorButton>

            <CalculatorButton
                state={ calculationState }
                onClick={ appendSelf }>
                    +
            </CalculatorButton>

            <CalculatorButton
                onClick={ () => reset(result) }>
                    AC
            </CalculatorButton>
        </div>
    );
};

/**
 * Represents a calculator button
*/
const CalculatorButton = ({ className, onClick, state, children }) => (
    <button
        className={
            [ ...(
                    new Set(
                        (className || "")
                            .split(" ")
                            .filter(cls => cls)
                    )
                ).add("calculator__button")
            ].join(" ") }
        onClick={ onClick }
        disabled={ CALCULATION_STATE_FETCHING === state }>
            { children }
    </button>
);

/**
 * Represents an expression or result in a MenuEntry
 */
const MenuNumber = ({ number, setResult, className }) => (
    <div
        className={ className }
        onClick={ () => setResult(number) }>
            { toPrintableExpression(number) }
    </div>
);

/**
 * Represents an entry in the history menu
*/
const MenuEntry = ({ cacheEntry, setResult }) => (
    <div className="calculator__menu_entry">
        <MenuNumber
            className="calculator__menu_expression"
            number={ cacheEntry[0] }
            setResult={ setResult } />

        <div className="calculator__menu_equals">=</div>

        <MenuNumber
            className="calculator__menu_result"
            number={ cacheEntry[1] }
            setResult={ setResult } />
    </div>
);

/**
 * Represents the history menu
*/
const CalculatorMenu = ({ cache, visible, setResult }) => (
    <div className={
        visible
            ? "calculator__menu"
            : "calculator__menu-hidden"
        }>
        {
            cache && cache.length
                ? cache.map(
                    (cacheEntry, i) => (
                        <MenuEntry
                            key={ i }
                            cacheEntry={ cacheEntry }
                            setResult={ setResult } />
                    )
                )
                : "Your calculations and results appear here so that you can reuse them"
        }
    </div>
);

ReactDOM.render(
    React.createElement(Calculator),
    document.querySelector('#calculator')
);