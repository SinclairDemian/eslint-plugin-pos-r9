/**
 * @fileoverview define the import file order for &#39;define&#39; function
 * @author zhu.caixia
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/define-order"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("define-order", rule, {

    valid: [

        `define([
            'i18n!modules/bf/businessobject/i18n/bf',
            'text!modules/bf/businessobject/templates/BoMgr.html',
            'modules/bf/businessobject/models/BoDetail',
            'modules/bf/bfcommon',
            'modules/bf/businessobject/actions/BoAction',
            'frm/fish-desktop/third-party/fileupload/fish.fileupload',
            'css!frm/fish-desktop/third-party/fileupload/fileupload'
        ], function(i18n, template, boDetail, bfCommon, BoAction) {

        })`
    ],

    invalid: [
        {
            code:
                `define([
                    'i18n!modules/bf/businessobject/i18n/bf',
                    'text!modules/bf/businessobject/templates/BoMgr.html'
                ], function(I18n, template) {

                })`,
            errors: [{message: 'Wrong import file order in \'define()\' function'}]
        }

    ]
});
