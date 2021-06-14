<?php

namespace App\Utils;

use App\Utils\Operators;

class Calculator {
    /**
     * @return float|string the result, or details about the error
    */
    public static function calculate(string $expression): float|string {
        // first, let's validate the expression
        if (!preg_match(
            "#^\s*\d+(\.\d+)?(\s*([+-/*]\s*\d+(\.\d+)?))*\s*$#",
            $expression
        )) {
            return "Invalid expression \"$expression\"";
        }

        if (!preg_match_all(
            "#[+-/*]|\d+(\.\d+)*#",
            $expression,
            $matches,
            PREG_UNMATCHED_AS_NULL
        )) {
            return "Failed to parse expression \"$expression\"";
        }

        $expression = $matches = $matches[0];
        unset($matches);
        $operatorsInstance = Operators::getInstance();

        /**
         * @var int[] all priorities existing in the expression
         */
        $priorities = [];

        // let's replace symbols by their corresponding Operator instance
        // in $expression
        foreach ($expression as $i => $element) {
            $operator = $operatorsInstance->getBySymbol($element);

            if ($operator) {
                $expression[$i] = $operator;
                $priority = $operator->getPriority();
                $priorities[$priority] = $priority;
                unset($priority);
            }

            unset($operator);
        }

        // let's sort priorities for calculation
        sort($priorities);

        // for each priority
        foreach ($priorities as $priority) {
            // while there are Operator with this priority in $expression
            while (null !== (
                // the Operator index
                $i = Arrays::find($expression,
                    /**
                     * @param string|float|Operator $element
                     * @return bool true if $element is an Operator with the current priority
                    */
                    function($element) use ($priority) {
                        return $element instanceof Operator
                            && $element->getPriority() === $priority;
                    }
                )
            )) {
                // extract the elements to calculate
                $extract = array_splice($expression, $i-1, 3);

                // tests the result
                if (3 !== count($extract)) {
                    return "Failed to extract";
                }

                // the variables for calculation
                list ($left, $operator, $right) = $extract;
                unset($extract);

                if (!is_numeric($left)) {
                    return "Invalid token $left";
                }

                if (!is_numeric($right)) {
                    return "Invalid token $right";
                }

                // the calculation result
                $result = $operator->calculate(
                    (float) $left, (float) $right
                );

                unset($left, $right);
                // put the result in place in $expression
                array_splice($expression, $i-1, 0, $result);
                unset($result);
            }

            unset($i, $priority);
        }

        unset($priorities);

        // tests this cas of error
        if (!$expression) {
            return "No result";
        }

        $expression = array_pop($expression);

        // tests this case of error
        if (!is_numeric($expression)) {
            return "Not float";
        }

        return (float) $expression;
    }
}