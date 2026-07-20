1. Use celery for sending mail after user signing up
    - email verify
    
2. Send Forgot Password link not otp

Permission
----------
permissions : [
    {
        role_id: 1
        resource: comment,
        read: True,
        create: True,
        update: True,
        delete: True,
        export: True,
        import: True,
        only_if_creator: False,
    },
    {
        role_id: 1
        resource: task,
        read: True,
        create: True,
        update: True,
        delete: True,
        export: True,
        import: True,
        only_if_creator: True,
    }
]

I will have roles
I will have role profiles

all permissions will be merged
super admin will be above all permissions


| role_id | resource | read | create | update | delete | export | import | only_if_creator |
| ------- | -------- | ---- | ------ | ------ | ------ | ------ | ------ | --------------- |
| 1       | course  | ✓    | ✓      | ✓      | ✓      | ✓      | ✓      | ✗               |
| 1       | lesson     | ✓    | ✓      | ✓      | ✓      | ✓      | ✓      | ✓               |


thebiosport-crm/
├── backend/
|   |__.env
├── frontend/
|   |__.env
└── compose.yml