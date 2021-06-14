<?php

namespace App\Utils;

/**
 * A collection of Operator
*/
class Operators {
    /**
     * @var Operators
     */
    private static $SINGLETON;

    /**
     * @var Operator[]
    */
    private $operators;

    private function __construct() {
        $divide = new class implements Operator {
            public function getSymbol() {
                return '/';
            }

            public function getPriority() {
                return 0;
            }

            public function calculate(float $left, float $right) {
                return $left / $right;
            }
        };

        $multiply = new class implements Operator {
            public function getSymbol() {
                return '*';
            }

            public function getPriority() {
                return 0;
            }

            public function calculate(float $left, float $right) {
                return $left * $right;
            }
        };

        $sum = new class implements Operator {
            public function getSymbol() {
                return '+';
            }

            public function getPriority() {
                return 1;
            }

            public function calculate(float $left, float $right) {
                return $left + $right;
            }
        };

        $substract = new class implements Operator {
            public function getSymbol() {
                return '-';
            }

            public function getPriority() {
                return 1;
            }

            public function calculate(float $left, float $right) {
                return $left - $right;
            }
        };

        $this->operators = [ $divide, $multiply, $sum, $substract ];
    }

    /**
     * @return Operators the singleton
     */
    public static function getInstance() {
        if (!isset(self::$SINGLETON)) {
            self::$SINGLETON = new self();
        }

        return self::$SINGLETON;
    }

    /**
     * Retrieves an Operator by its symbol
     * @return ?Operator
    */
    public function getBySymbol(string $symbol) {
        foreach ($this->operators as $operator) {
            if ($operator->getSymbol() === $symbol) {
                return $operator;
            }
        }
    }
}