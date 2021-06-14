<?php

declare(strict_types=1);

namespace App\Tests\Utils;

use App\Utils\Calculator;
use PHPUnit\Framework\TestCase;

class CalculatorTestCase extends TestCase {
    public function testBaseCase() {
        $this->assertEquals(1,
            Calculator::calculate('1')
        );
    }

    /**
     * @depends testBaseCase
    */
    public function testSum() {
        $this->assertEquals(2,
            Calculator::calculate(' 1 +    1 ')
        );
    }

    /**
     * @depends testBaseCase
    */
    public function testPriorities() {
        $this->assertEquals(12,
            Calculator::calculate(' 6 + 4 - 6 / 2 + 5')
        );
    }

    public function testInvalidExpression() {
        $expression = "test";

        $this->assertEquals(
            "Invalid expression \"$expression\"",
            Calculator::calculate($expression)
        );
    }
}