export const mockData = {
    user: {
        name: "Manas Gangrade",
        date: "Mon, Feb 20, 2025",
        verified: true
    },
    stats: {
        totalReceived: "₹86,00,000",
        upcomingAmount: "₹86,00,000",
        toBeReleased: "₹86,00,000"
    },
    projects: [
        {
            id: "1",
            title: "Serenity Reserve",
            location: "Scheme No 140, Indore",
            developer: "Prakrati Realtors Private Limited",
            possession: "Apr, 2027",
            avgPrice: "₹9.25k",
            rera: true,
            apartments: [
                { type: "3 BHK APARTMENT", price: "₹2.5 Cr - ₹2.6 Cr" },
                { type: "4 BHK APARTMENT", price: "₹3.5 Cr" }
            ],
            units: {
                total: 45,
                avail: 12,
                sold: 33
            },
            imagesCount: "1/28",
            visits: {
                metrics: [
                    { label: "TOTAL", value: "1,284", delta: "+12%", valueColor: "#4F46E5" },
                    { label: "HOT", value: "156", delta: "+5%", valueColor: "#F97316" },
                    { label: "CONV.", value: "42", delta: "+8%", valueColor: "#10B981" }
                ],
                pipeline: {
                    title: "Sales Pipeline",
                    action: "View Details",
                    stages: [
                        { label: "New", value: 86, height: 28 },
                        { label: "Contacted", value: 198, height: 44 },
                        { label: "Visits", value: 342, height: 58, active: true },
                        { label: "Negot.", value: 74, height: 34 }
                    ]
                },
                followUps: [
                    { type: "SITE VISIT", time: "10:30 AM", name: "Rahul Sharma", project: "Skyline Residency", tone: "indigo" },
                    { type: "CALL", time: "02:00 PM", name: "Ananya Iyer", project: "Green Valley Towers", tone: "orange" }
                ],
                leads: [
                    { initials: "RS", name: "Rohan Singh", project: "Skyline Residency", meta: "3 BHK", tag: "HOT", tagTone: "hot" },
                    { initials: "PM", name: "Priya Menon", project: "The Grand Atrium", meta: "Commercial", tag: "WARM", tagTone: "warm" }
                ]
            },
            deals: [
                {
                    title: "Tower A • Unit A-302",
                    amount: "₹1,00,000",
                    date: "9 May 2026",
                    status: "Token Received",
                    statusTone: "success",
                    progress: 33,
                    steps: [
                        { label: "TOKEN", state: "done" },
                        { label: "AGREEMENT", state: "current" },
                        { label: "POSSESSION", state: "upcoming" }
                    ]
                },
                {
                    title: "Shop G-12",
                    amount: "₹5,00,000",
                    date: "12 May 2026",
                    status: "Installment Received",
                    statusTone: "info",
                    milestone: {
                        title: "2nd Milestone Completed",
                        subtitle: "Structural floor casting stage"
                    },
                    footer: {
                        left: "Due Next: ₹2,50,000",
                        right: "June 2026"
                    }
                },
                {
                    title: "Tower C • Unit C-505",
                    amount: "₹0",
                    date: "Drafting Stage",
                    status: "Agreement Stage",
                    statusTone: "warning",
                    note: "Documents currently being reviewed by legal team.",
                    action: "View Documents"
                },
                {
                    title: "Villa V-07",
                    amount: "₹10,00,000",
                    date: "Due Soon",
                    status: "Upcoming Token",
                    statusTone: "muted",
                    customer: {
                        name: "Rahul Sharma",
                        contact: "+91 98XXX-XX001"
                    },
                    actions: ["Remind", "Collect Now"]
                }
            ],
            inventory: {
                apartment: {
                    towers: [
                        {
                            key: "tower-a",
                            label: "Tower A",
                            sections: [
                                {
                                    rowLabel: "FLOOR 1",
                                    units: [
                                        { id: "#1201", status: "Available", title: "3 BHK + Study", area: "1,850 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                        { id: "#1202", status: "Booked", title: "2 BHK Premium", area: "1,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                                    ]
                                },
                                {
                                    rowLabel: "FLOOR 2",
                                    units: [
                                        { id: "#1101", status: "Sold", title: "3 BHK + Study", area: "1,850 Sq.Ft", ctaLabel: "LOCKED", ctaVariant: "disabled", actionIcon: "eye", dimmed: true },
                                        { id: "#1102", status: "Available", title: "2 BHK Premium", area: "1,250 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
                                    ]
                                }
                            ]
                        },
                        {
                            key: "tower-b",
                            label: "Tower B",
                            sections: [
                                {
                                    rowLabel: "FLOOR 1",
                                    units: [
                                        { id: "#2201", status: "Available", title: "4 BHK Premium", area: "2,150 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                        { id: "#2202", status: "Tokened", title: "3 BHK Premium", area: "1,650 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                                    ]
                                },
                                {
                                    rowLabel: "FLOOR 2",
                                    units: [
                                        { id: "#2101", status: "Booked", title: "3 BHK Premium", area: "1,720 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#2102", status: "Available", title: "2 BHK Compact", area: "1,180 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
                                    ]
                                }
                            ]
                        },
                        {
                            key: "tower-c",
                            label: "Tower C",
                            sections: [
                                {
                                    rowLabel: "FLOOR 1",
                                    units: [
                                        { id: "#3201", status: "Booked", title: "3 BHK Corner", area: "1,900 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#3202", status: "Available", title: "2 BHK Compact", area: "1,180 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
                                    ]
                                },
                                {
                                    rowLabel: "FLOOR 2",
                                    units: [
                                        { id: "#3101", status: "Available", title: "3 BHK Corner", area: "1,900 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                        { id: "#3102", status: "Sold", title: "2 BHK Compact", area: "1,180 Sq.Ft", ctaLabel: "LOCKED", ctaVariant: "disabled", actionIcon: "eye", dimmed: true }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                villa: {
                    sections: [
                        {
                            rowLabel: "ROW 1",
                            units: [
                                { id: "V-01", status: "Available", title: "4 BHK Villa", area: "3,400 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "V-02", status: "Booked", title: "4 BHK Villa", area: "3,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        },
                        {
                            rowLabel: "ROW 2",
                            units: [
                                { id: "V-03", status: "Tokened", title: "5 BHK Villa", area: "4,100 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                { id: "V-04", status: "Available", title: "3 BHK Villa", area: "2,900 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
                            ]
                        }
                    ]
                },
                rowhouse: {
                    sections: [
                        {
                            rowLabel: "ROW 1",
                            units: [
                                { id: "R-01", status: "Available", title: "3 BHK Rowhouse", area: "2,050 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "R-02", status: "Booked", title: "3 BHK Rowhouse", area: "2,100 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        },
                        {
                            rowLabel: "ROW 2",
                            units: [
                                { id: "R-03", status: "Sold", title: "4 BHK Rowhouse", area: "2,400 Sq.Ft", ctaLabel: "LOCKED", ctaVariant: "disabled", actionIcon: "eye", dimmed: true },
                                { id: "R-04", status: "Tokened", title: "3 BHK Rowhouse", area: "2,000 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        }
                    ]
                },
                plot: {
                    stacks: [
                        {
                            key: "stack-a",
                            label: "Stack A",
                            levels: [
                                {
                                    level: 12,
                                    cards: [
                                        { unit: "A-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: true, icon: "checkmark-circle" },
                                        { unit: "B-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" },
                                        { unit: "C-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" }
                                    ]
                                },
                                {
                                    level: 11,
                                    cards: [
                                        { unit: "A-1101", meta: "3 BHK • 1450 sq.ft.", price: "Reserved", status: "Reserved", active: false, icon: "lock-closed" },
                                        { unit: "B-1101", meta: "3 BHK • 1450 sq.ft.", price: "In Process", status: "In Process", active: false, icon: "hourglass-outline" },
                                        { unit: "C-1101", meta: "3 BHK • 1450 sq.ft.", price: "Reserved", status: "Reserved", active: false, icon: "lock-closed" }
                                    ]
                                },
                                {
                                    level: 10,
                                    cards: []
                                }
                            ]
                        },
                        {
                            key: "stack-b",
                            label: "Stack B",
                            levels: [
                                {
                                    level: 12,
                                    cards: [
                                        { unit: "B-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" },
                                        { unit: "C-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" },
                                        { unit: "D-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" }
                                    ]
                                },
                                {
                                    level: 11,
                                    cards: [
                                        { unit: "B-1101", meta: "3 BHK • 1450 sq.ft.", price: "In Process", status: "In Process", active: false, icon: "hourglass-outline" },
                                        { unit: "C-1101", meta: "3 BHK • 1450 sq.ft.", price: "Reserved", status: "Reserved", active: false, icon: "lock-closed" },
                                        { unit: "D-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" }
                                    ]
                                },
                                {
                                    level: 10,
                                    cards: []
                                }
                            ]
                        },
                        {
                            key: "stack-c",
                            label: "Stack C",
                            levels: [
                                {
                                    level: 12,
                                    cards: [
                                        { unit: "C-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" },
                                        { unit: "D-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" },
                                        { unit: "E-1202", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Available", active: false, icon: "checkmark-circle" }
                                    ]
                                },
                                {
                                    level: 11,
                                    cards: [
                                        { unit: "C-1101", meta: "3 BHK • 1450 sq.ft.", price: "Reserved", status: "Reserved", active: false, icon: "lock-closed" },
                                        { unit: "D-1101", meta: "3 BHK • 1450 sq.ft.", price: "In Process", status: "In Process", active: false, icon: "hourglass-outline" },
                                        { unit: "E-1101", meta: "3 BHK • 1450 sq.ft.", price: "Reserved", status: "Reserved", active: false, icon: "lock-closed" }
                                    ]
                                },
                                {
                                    level: 10,
                                    cards: []
                                }
                            ]
                        }
                    ]
                },
                shop: {
                    sections: [
                        {
                            rowLabel: "ROW 1",
                            units: [
                                { id: "S-01", status: "Available", title: "Retail Shop", area: "1,120 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "S-02", status: "Booked", title: "Cafe Space", area: "980 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        },
                        {
                            rowLabel: "ROW 2",
                            units: [
                                { id: "S-03", status: "Tokened", title: "Retail Shop", area: "1,300 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                { id: "S-04", status: "Available", title: "Bank Space", area: "1,450 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
                            ]
                        }
                    ]
                }
            }
        },
        {
            id: "2",
            title: "Royal Palms",
            location: "Vijay Nagar, Indore",
            developer: "Skyline Developers",
            possession: "Dec, 2026",
            avgPrice: "₹8.50k",
            rera: true,
            apartments: [
                { type: "2 BHK APARTMENT", price: "₹1.2 Cr - ₹1.4 Cr" },
                { type: "3 BHK APARTMENT", price: "₹1.8 Cr" }
            ],
            units: {
                total: 80,
                avail: 25,
                sold: 55
            },
            imagesCount: "1/15",
            inventory: {
                apartment: { sections: [] },
                villa: { sections: [] },
                rowhouse: { sections: [] },
                plot: { stacks: [] },
                shop: { sections: [] }
            }
        }
    ]
};
