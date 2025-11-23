<?php 

if (!function_exists('dd')) {

    function dd(...$args)
    {
        $dump = function ($x) {
            echo "<pre>";
            var_dump($x);
            echo "</pre>";
        };

        // Output all arguments
        foreach ($args as $arg) {
            $dump($arg);
        }

        // Halt the script execution
        die(1);
    }
}

