<?php

namespace App\Utils;

interface Operator {
    /**
     * @return int
     */
    public function getPriority();

    /**
     * @return string
    */
    public function getSymbol();

    /**
     * @return float
     */
    public function calculate(float $left, float $right);
}