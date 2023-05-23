var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

// Used also for components :)
var ServerFlowSchema = mongoose.Schema({


    is_system_still_needed:{
        checked: Boolean
    },

    can_system_be_virtualized:{
        checked: Boolean
    },

    can_system_go_to_Frankfurt:{
        checked: Boolean
    },

    which_conditions:{
        checked: Boolean,
        message: String
    },
    reason:{
        checked: Boolean,
        message: String
    },
    new_maintenance_contract_or_new_hardware:{
        checked: Boolean,
        message: String
    },

    dependencies_known:{
        checked: Boolean,
        message: String

    },
    which_applications:{
        checked: Boolean,
        message: String
        
    },
    latencies:{
        checked: Boolean,
        message: String

    },
    timeline_known:{
        checked: Boolean,
        date:Date
    },
    was_test_migration_executed: {
        checked: Boolean
    },
    attributes_instance: {
        checked: Boolean
    },
    has_open_work: {
        checked: Boolean
    },
    was_test_migration_successfull: {
        checked: Boolean,
        content: [{
            old_name: String,
            new_name: String
        }]
    },
    
    attributes: {
        
    }
}, {strict: false, timestamps: false});


module.exports = ServerFlowSchema;