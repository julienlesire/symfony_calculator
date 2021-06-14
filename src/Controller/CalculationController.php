<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

use App\Utils\Calculator;

class CalculationController {
    public function calculate(Request $request) {
        $result = Calculator::calculate(
            $request->request->get('expression') ?: ''
        );

        if (is_string($result)) {
            return new JsonResponse(
                [ 'error' => $result ],
                400
            );
        }

        return new JsonResponse(
            [ 'result' => $result ]
        );
    }
}