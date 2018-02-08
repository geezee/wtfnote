<?php

function makeError($errorMessage) {
    return [
        "error" => true,
        "message" => $errorMessage
    ];
}

function noError() {
    return [ "error" => false ];
}
