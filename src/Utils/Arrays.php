<?php

namespace App\Utils;

class Arrays {
    /**
     * @return int|string|null
    */
    public static function find(array $array, callable $callback) {
        foreach ($array as $key => $value) {
            if (call_user_func($callback, $value, $key)) {
                return $key;
            }
        }
    }
}