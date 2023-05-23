// Important
// See ./flow/* for real models

var workflow=[{
    restrict: "server",
    code: "is_system_still_needed",
    type: "boolean",
    category: "planning",
    true: {
        status: 'progress'
    },
    false: {
        status: 'error'
    }
},
    {
        restrict: "server",
        code: "can_system_be_virtualized",
        type: "boolean",
        category: "planning",
        true: {
            status: 'progress'
        },
        false: {
            status: 'error'
        }
    },

    {
        restrict: "server",
        code: "can_system_go_to_Frankfurt",
        type: "input",
        category: "planning",
        true: {
            status: 'progress',
            cond:'yes',
            quest1:{
                restrict: "server",
                code: "which_conditions",
                type: "input",
                category: "planning",
                true: {
                    status: 'progress'
                },
                false: {
                    status: 'error'
                }
            },
        },
        false: {
            status: 'progress',
            cond:'no',
            quest2:{
                restrict: "server",
                code: "reason",
                type: "input",
                category: "planning",
                true: {
                    status: 'progress'
                },
                false: {
                    status: 'error'
                }
            },
            quest3:{
                restrict: "server",
                code: "new_maintenance_contract_or_new_hardware",
                type: "input",
                category: "planning",
                true: {
                    status: 'progress'
                },
                false: {
                    status: 'error'
                }
            },

        }
    },
    ];

workflow.push({
        restrict: "server",
        code: "dependencies_known",
        type: "input",
        category: "planning",
        true: {
            status: 'progress'
        },
        false: {
            status: 'error'
        }
    });
workflow.push({
        restrict: "server",
        code: "which_applications",
        type: "input",
        category: "planning",
        true: {
            status: 'progress'
        },
        false: {
            status: 'error'
        }
    });

workflow.push({
        restrict: "server",
        code: "latencies",
        type: "input",
        category: "planning",
        true: {
            status: 'progress'
        },
        false: {
            status: 'error'
        }
    });

workflow.push({
        restrict: "server",
        code: "timeline_known",
        type: "datetime",
        category: "planning",
        true: {
            status: 'progress'
        },
        false: {
            status: 'error'
        }

    });



   /* {
    restrict: "server",
    code: "is_system_owner_known",
    type: "input",
    category: "planning",
    attribute: "owner",
    true: {
        status: 'progress'
    },
    false: {
        status: 'progress'
    }
}, {
    restrict: "applications",
    code: "is_app_owner_known",
    type: "input",
    attribute: "owner",
    category: "planning",
    true: {
        status: 'progress'
    },
    false: {
        status: 'progress'
    }
}, {
    restrict: "server",
    code: "has_system_owner_informed",
    category: "planning",
    type: "boolean",
    true: {
        status: 'progress'
    },
    false: {
        status: 'error'
    }
}, {
    restrict: "applications",
    code: "has_app_owner_informed",
    category: "planning",
    type: "boolean",
    true: {
        status: 'progress'
    },
    false: {
        status: 'error'
    }
}, {
    code: "was_test_migration_possible",
    type: "boolean",
    category: "planning",
    true: {
        status: 'progress'
    },
    false: {
        status: 'progress'
    }
}, {
    code: "planning_start",
    type: "datetime",
    category: "planning",
    true: {
        status: 'progress'
    },
    false: {
        status: 'error'
    }
}, {
    code: "planning_end",
    type: "datetime",
    category: "planning",
    true: {
        status: 'progress'
    },
    false: {
        status: 'error'
    }
}, */
workflow.push(
   {
    code: "was_test_migration_executed",
    type: "boolean",
    category: "migration",
    true: {
        status: 'progress'
    },
    false: {
        status: 'progress'
    }
});
workflow.push({
    code: "attributes_instance",
    type: "attributes",
    category: "inventory",
    true: {
        status: 'progress',
        inventory: true
    },
    false: {
        status: 'progress',
        inventory: false
    }
});

workflow.push({
    code: "has_open_work",
    type: "boolean",
    category: "migration",
    true: {
        status: 'progress'
    },
    false: {
        status: 'progress'
    }
});
workflow.push({
    code: "was_test_migration_successfull",
    type: "server_move",
    category: "migration",
    true: {
        status: 'done',
        migrated: true
    },
    false: {
        status: 'error',
        migrated: false
    }
});


module.exports = workflow;