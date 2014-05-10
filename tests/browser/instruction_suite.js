if (typeof define !== 'function') { var define = require('amdefine')(module);}

if (typeof nodeunit === 'undefined') { var nodeunit = {run: function(){}};}


define (
    [
        '../tests_browser/adc_test.js',
        '../tests_browser/and_test.js',
        '../tests_browser/asl_test.js',
        '../tests_browser/bcc_test.js',
        '../tests_browser/bcs_test.js',
        '../tests_browser/beq_test.js',
        '../tests_browser/bit_test.js',
        '../tests_browser/bmi_test.js',
        '../tests_browser/bne_test.js',
        '../tests_browser/bpl_test.js',
        '../tests_browser/bvc_test.js',
        '../tests_browser/bvs_test.js'
    ],


    function(
            adc_test,
            and_test,
            asl_test,
            bcc_test,
            bcs_test,
            beq_test,
            bit_test,
            bmi_test,
            bne_test,
            bpl_test,
            bvc_test,
            bvs_test
        ) {

            nodeunit.run(
                {
                    'adc test': adc_test,
                    'and_test': and_test,
                    'asl_test': asl_test,
                    'bcc_test': bcc_test,
                    'bcs_test': bcs_test,
                    'beq_test': bcs_test,
                    'bit_test': bit_test,
                    'bmi_test': bmi_test,
                    'bne_test': bne_test,
                    'bpl_test': bpl_test,
                    'bvc_test': bvc_test,
                    'bvs_test': bvs_test
                }
            );


        }
);

