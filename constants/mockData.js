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
                total: 120,
                avail: 48,
                sold: 32,
                booked: 24,
                token: 16
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
                        { label: "New", value: 14, height: 28 },
                        { label: "Contacted", value: 10, height: 28 },
                        { label: "Visit\nSched.", value: 8, height: 28 },
                        { label: "Visited", value: 6, height: 28, active: true },
                        { label: "Negotiation", value: 4, height: 28 },
                        { label: "Token", value: 3, height: 28 },
                        { label: "Done", value: 1, height: 28 }
                    ]
                },
                followUps: [
                    { initials: "RS", type: "Site Visit", time: "Today 4:30 PM", name: "Rahul Sharma", project: "Serenity Reserve • 3 BHK", salesperson: "Sales Officer: Amit Verma", tone: "indigo", action: "Update" },
                    { initials: "PK", type: "Meeting", time: "Tomorrow 11 AM", name: "Priya Kulkarni", project: "Serenity Reserve • 4 BHK", salesperson: "Sales Officer: Riya Joshi", tone: "orange", action: "Update" }
                ]
            },
            deals: [
                {
                    propertyType: "3 BHK Apartment",
                    area: "1,450 Sq.Ft",
                    possession: "Apr, 2027",
                    avgPricePerSqft: "₹9.25k",
                    amenities: ["Gymnasium", "Swimming Pool", "24/7 Security", "Power Backup"],
                    bookedBy: "Rahul Sharma",
                    mobile: "98XXXX01",
                    bookingDate: "22 May 2026",
                    tokenAmount: "₹51,000",
                    dealValue: "₹84,00,000",
                    received: "₹10,51,000",
                    pending: "₹73,49,000",
                    nextDue: "15 June 2026",
                    dealStatus: "Agreement Pending",
                    bookingAmount: "₹10,00,000",
                    bookingAmountDate: "30 May 2026",
                    agreementAmount: "₹20,00,000",
                    registryAmount: "₹40,00,000",
                    registryDue: "—",
                    paymentSchedule: [
                        { title: "Token", amount: "₹51,000", detail: "22 May 2026 • Received by SquarFT", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Booking Amount", amount: "₹10,00,000", detail: "30 May 2026", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Agreement", amount: "₹20,00,000", detail: "Due: 15 June 2026", status: "Upcoming", tone: "warning" },
                        { title: "Registry", amount: "₹40,00,000", detail: "Due: Later", status: "Upcoming", tone: "warning" },
                    ],
                    title: "Tower A • Unit A-302",
                    contactLine: "Rahul Sharma • 98XXXX01",
                    topStatus: "Token Done",
                    footerStatus: "Token Paid",
                    footerTotal: "₹84,00,000 Total",
                    footerDue: "Next Due: 15 June 2026",
                    progress: 33,
                    steps: [
                        { label: "TOKEN", state: "done" },
                        { label: "AGREEMENT", state: "current" },
                        { label: "POSSESSION", state: "upcoming" }
                    ]
                },
                {
                    propertyType: "Retail Shop",
                    area: "980 Sq.Ft",
                    possession: "Apr, 2027",
                    avgPricePerSqft: "₹9.25k",
                    amenities: ["Car Parking", "24/7 Security", "Power Backup", "Wi-Fi Zone"],
                    bookedBy: "Priya Kulkarni",
                    mobile: "98XXXX12",
                    bookingDate: "24 May 2026",
                    tokenAmount: "₹42,000",
                    dealValue: "₹42,00,000",
                    received: "₹12,10,000",
                    pending: "₹29,90,000",
                    nextDue: "22 June 2026",
                    dealStatus: "Installment",
                    bookingAmount: "₹10,00,000",
                    bookingAmountDate: "30 May 2026",
                    agreementAmount: "₹8,00,000",
                    registryAmount: "₹24,00,000",
                    registryDue: "Later",
                    paymentSchedule: [
                        { title: "Token", amount: "₹42,000", detail: "24 May 2026 • Received by SquarFT", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Booking Amount", amount: "₹10,00,000", detail: "30 May 2026", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Agreement", amount: "₹8,00,000", detail: "Due: 22 June 2026", status: "Upcoming", tone: "warning" },
                        { title: "Registry", amount: "₹24,00,000", detail: "Due: Later", status: "Upcoming", tone: "warning" },
                    ],
                    title: "Shop G-12",
                    contactLine: "Priya Kulkarni • 98XXXX12",
                    topStatus: "Installment",
                    footerStatus: "Paid",
                    footerTotal: "₹42,00,000 Total",
                    footerDue: "Next Due: 22 June 2026",
                    progress: 58,
                    steps: [
                        { label: "TOKEN", state: "done" },
                        { label: "AGREEMENT", state: "done" },
                        { label: "POSSESSION", state: "current" }
                    ]
                },
                {
                    propertyType: "3 BHK Apartment",
                    area: "1,900 Sq.Ft",
                    possession: "Apr, 2027",
                    avgPricePerSqft: "₹9.25k",
                    amenities: ["Clubhouse", "Garden", "Sports Court", "Power Backup"],
                    bookedBy: "Aman Verma",
                    mobile: "98XXXX34",
                    bookingDate: "18 May 2026",
                    tokenAmount: "₹75,000",
                    dealValue: "₹96,00,000",
                    received: "₹22,00,000",
                    pending: "₹74,00,000",
                    nextDue: "15 July 2026",
                    dealStatus: "Agreement Pending",
                    bookingAmount: "₹15,00,000",
                    bookingAmountDate: "25 May 2026",
                    agreementAmount: "₹30,00,000",
                    registryAmount: "₹44,00,000",
                    registryDue: "Later",
                    paymentSchedule: [
                        { title: "Token", amount: "₹75,000", detail: "18 May 2026 • Received by SquarFT", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Booking Amount", amount: "₹15,00,000", detail: "25 May 2026", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Agreement", amount: "₹30,00,000", detail: "Due: 15 July 2026", status: "Upcoming", tone: "warning" },
                        { title: "Registry", amount: "₹44,00,000", detail: "Due: Later", status: "Upcoming", tone: "warning" },
                    ],
                    title: "Tower C • Unit C-505",
                    contactLine: "Aman Verma • 98XXXX34",
                    topStatus: "Agreement",
                    footerStatus: "Upcoming",
                    footerTotal: "₹96,00,000 Total",
                    footerDue: "Next Due: 15 July 2026",
                    progress: 72,
                    steps: [
                        { label: "TOKEN", state: "done" },
                        { label: "AGREEMENT", state: "current" },
                        { label: "POSSESSION", state: "upcoming" }
                    ]
                },
                {
                    propertyType: "Villa",
                    area: "3,400 Sq.Ft",
                    possession: "Apr, 2027",
                    avgPricePerSqft: "₹9.25k",
                    amenities: ["Garden", "Car Parking", "24/7 Security", "Clubhouse"],
                    bookedBy: "Neha Kapoor",
                    mobile: "98XXXX78",
                    bookingDate: "20 May 2026",
                    tokenAmount: "₹1,25,000",
                    dealValue: "₹1,25,00,000",
                    received: "₹25,00,000",
                    pending: "₹1,00,00,000",
                    nextDue: "30 June 2026",
                    dealStatus: "Upcoming Token",
                    bookingAmount: "₹20,00,000",
                    bookingAmountDate: "28 May 2026",
                    agreementAmount: "₹35,00,000",
                    registryAmount: "₹45,00,000",
                    registryDue: "Later",
                    paymentSchedule: [
                        { title: "Token", amount: "₹1,25,000", detail: "20 May 2026 • Received by SquarFT", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Booking Amount", amount: "₹20,00,000", detail: "28 May 2026", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Agreement", amount: "₹35,00,000", detail: "Due: 30 June 2026", status: "Upcoming", tone: "warning" },
                        { title: "Registry", amount: "₹45,00,000", detail: "Due: Later", status: "Upcoming", tone: "warning" },
                    ],
                    title: "Villa V-07",
                    contactLine: "Neha Kapoor • 98XXXX78",
                    topStatus: "Upcoming Token",
                    footerStatus: "Due Soon",
                    footerTotal: "₹1,25,00,000 Total",
                    footerDue: "Next Due: 30 June 2026",
                    progress: 19,
                    steps: [
                        { label: "TOKEN", state: "current" },
                        { label: "AGREEMENT", state: "upcoming" },
                        { label: "POSSESSION", state: "upcoming" }
                    ]
                }
            ],
            amenities: ["Gymnasium", "Swimming Pool", "24/7 Security", "Power Backup"],
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
                                        { id: "#1201", status: "Available", title: "3 BHK + Study", price: "₹2.55 Cr", area: "1,850 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                        { id: "#1202", status: "Booked", title: "2 BHK Premium", price: "₹1.72 Cr", area: "1,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#1203", status: "Booked", title: "2 BHK Premium", price: "₹1.72 Cr", area: "1,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#1204", status: "Booked", title: "2 BHK Premium", price: "₹1.72 Cr", area: "1,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#1205", status: "Booked", title: "2 BHK Premium", price: "₹1.72 Cr", area: "1,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                    ]
                                },
                                {
                                    rowLabel: "FLOOR 2",
                                    units: [
                                        { id: "#1101", status: "Sold", title: "3 BHK + Study", price: "₹2.55 Cr", area: "1,850 Sq.Ft", ctaLabel: "LOCKED", ctaVariant: "disabled", actionIcon: "eye", dimmed: true },
                                        { id: "#1102", status: "Available", title: "2 BHK Premium", price: "₹1.72 Cr", area: "1,250 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                        { id: "#1206", status: "Booked", title: "2 BHK Premium", price: "₹1.72 Cr", area: "1,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#1207", status: "Booked", title: "2 BHK Premium", price: "₹1.72 Cr", area: "1,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#1208", status: "Booked", title: "2 BHK Premium", price: "₹1.72 Cr", area: "1,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
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
                                        { id: "#2201", status: "Available", title: "4 BHK Premium", price: "₹3.25 Cr", area: "2,150 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                        { id: "#2202", status: "Sold", title: "3 BHK Premium", price: "₹2.48 Cr", area: "1,650 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                                    ]
                                },
                                {
                                    rowLabel: "FLOOR 2",
                                    units: [
                                        { id: "#2101", status: "Booked", title: "3 BHK Premium", price: "₹2.61 Cr", area: "1,720 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#2102", status: "Available", title: "2 BHK Compact", price: "₹1.58 Cr", area: "1,180 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
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
                                        { id: "#3201", status: "Booked", title: "3 BHK Corner", price: "₹2.72 Cr", area: "1,900 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                        { id: "#3202", status: "Available", title: "2 BHK Compact", price: "₹1.58 Cr", area: "1,180 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
                                    ]
                                },
                                {
                                    rowLabel: "FLOOR 2",
                                    units: [
                                        { id: "#3101", status: "Available", title: "3 BHK Corner", price: "₹2.72 Cr", area: "1,900 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                        { id: "#3102", status: "Sold", title: "2 BHK Compact", price: "₹1.58 Cr", area: "1,180 Sq.Ft", ctaLabel: "LOCKED", ctaVariant: "disabled", actionIcon: "eye", dimmed: true }
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
                                { id: "V-01", status: "Available", title: "4 BHK Villa", price: "₹4.15 Cr", area: "3,400 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "V-02", status: "Booked", title: "4 BHK Villa", price: "₹4.05 Cr", area: "3,250 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        },
                        {
                            rowLabel: "ROW 2",
                            units: [
                                { id: "V-03", status: "Sold", title: "5 BHK Villa", price: "₹5.20 Cr", area: "4,100 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                { id: "V-04", status: "Available", title: "3 BHK Villa", price: "₹3.35 Cr", area: "2,900 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
                            ]
                        }
                    ]
                },
                rowhouse: {
                    sections: [
                        {
                            rowLabel: "ROW 1",
                            units: [
                                { id: "R-01", status: "Available", title: "3 BHK Rowhouse", price: "₹2.95 Cr", area: "2,050 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "R-02", status: "Booked", title: "3 BHK Rowhouse", price: "₹3.02 Cr", area: "2,100 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        },
                        {
                            rowLabel: "ROW 2",
                            units: [
                                { id: "R-03", status: "Sold", title: "4 BHK Rowhouse", price: "₹3.45 Cr", area: "2,400 Sq.Ft", ctaLabel: "LOCKED", ctaVariant: "disabled", actionIcon: "eye", dimmed: true },
                                { id: "R-04", status: "Sold", title: "3 BHK Rowhouse", price: "₹2.88 Cr", area: "2,000 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
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
                                        { unit: "A-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Sold", active: false, icon: "lock-closed" },
                                        { unit: "B-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Booked", active: false, icon: "hourglass-outline" },
                                        { unit: "C-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Sold", active: false, icon: "lock-closed" }
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
                                        { unit: "B-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Booked", active: false, icon: "hourglass-outline" },
                                        { unit: "C-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Sold", active: false, icon: "lock-closed" },
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
                                        { unit: "C-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Sold", active: false, icon: "lock-closed" },
                                        { unit: "D-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Booked", active: false, icon: "hourglass-outline" },
                                        { unit: "E-1101", meta: "3 BHK • 1450 sq.ft.", price: "₹84,00,000", status: "Sold", active: false, icon: "lock-closed" }
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
                                { id: "S-01", status: "Available", title: "Retail Shop", price: "₹1.05 Cr", area: "1,120 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "S-02", status: "Booked", title: "Cafe Space", price: "₹92,00,000", area: "980 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        },
                        {
                            rowLabel: "ROW 2",
                            units: [
                                { id: "S-03", status: "Sold", title: "Retail Shop", price: "₹1.18 Cr", area: "1,300 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                { id: "S-04", status: "Available", title: "Bank Space", price: "₹1.32 Cr", area: "1,450 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
                            ]
                        }
                    ]
                }
                , showroom: {
                    sections: [
                        {
                            rowLabel: "SECTION 1",
                            units: [
                                { id: "SR-01", status: "Available", title: "Showroom", price: "₹1.48 Cr", area: "1,200 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "SR-02", status: "Booked", title: "Showroom", price: "₹1.62 Cr", area: "1,340 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        },
                        {
                            rowLabel: "SECTION 2",
                            units: [
                                { id: "SR-03", status: "Sold", title: "Showroom", price: "₹1.74 Cr", area: "1,420 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" },
                                { id: "SR-04", status: "Available", title: "Showroom", price: "₹1.55 Cr", area: "1,280 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" }
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
            visits: {
                metrics: [
                    { label: "TOTAL", value: "624", delta: "+9%", valueColor: "#4F46E5" },
                    { label: "HOT", value: "84", delta: "+4%", valueColor: "#F97316" },
                    { label: "CONV.", value: "19", delta: "+6%", valueColor: "#10B981" }
                ],
                pipeline: {
                    title: "Sales Pipeline",
                    action: "View Details",
                    stages: [
                        { label: "New", value: 9, height: 28 },
                        { label: "Contacted", value: 7, height: 28 },
                        { label: "Visited", value: 4, height: 28, active: true },
                        { label: "Negotiation", value: 3, height: 28 },
                        { label: "Token", value: 2, height: 28 }
                    ]
                },
                followUps: [
                    { initials: "AS", type: "Meeting", time: "Today 2:00 PM", name: "Amit Sharma", project: "Royal Palms • 2 BHK", salesperson: "Sales Officer: Neha Rao", tone: "indigo", action: "Update" }
                ]
            },
            deals: [
                {
                    propertyType: "2 BHK Apartment",
                    area: "1,180 Sq.Ft",
                    possession: "Dec, 2026",
                    avgPricePerSqft: "₹8.50k",
                    amenities: ["Gymnasium", "Swimming Pool", "24/7 Security", "Car Parking"],
                    bookedBy: "Amit Sharma",
                    mobile: "97XXXX45",
                    bookingDate: "16 May 2026",
                    tokenAmount: "₹75,000",
                    dealValue: "₹65,00,000",
                    received: "₹18,40,000",
                    pending: "₹46,60,000",
                    nextDue: "20 June 2026",
                    dealStatus: "Agreement Pending",
                    bookingAmount: "₹10,00,000",
                    bookingAmountDate: "30 May 2026",
                    agreementAmount: "₹15,00,000",
                    registryAmount: "₹36,60,000",
                    registryDue: "Later",
                    paymentSchedule: [
                        { title: "Token", amount: "₹75,000", detail: "16 May 2026 • Received by SquarFT", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Booking Amount", amount: "₹10,00,000", detail: "30 May 2026", status: "Paid", tone: "success", actionLabel: "View Receipt" },
                        { title: "Agreement", amount: "₹15,00,000", detail: "Due: 20 June 2026", status: "Upcoming", tone: "warning" },
                        { title: "Registry", amount: "₹36,60,000", detail: "Due: Later", status: "Upcoming", tone: "warning" },
                    ],
                    title: "Tower B • Unit B-202",
                    contactLine: "Amit Sharma • 97XXXX45",
                    amount: "₹75,000",
                    date: "16 May 2026",
                    topStatus: "Token Done",
                    footerStatus: "Token Paid",
                    footerTotal: "₹65,00,000 Total",
                    footerDue: "Next Due: 20 June 2026",
                    status: "Token Received",
                    statusTone: "success",
                    progress: 28,
                    steps: [
                        { label: "TOKEN", state: "done" },
                        { label: "AGREEMENT", state: "current" },
                        { label: "POSSESSION", state: "upcoming" }
                    ]
                }
            ],
            amenities: ["Gymnasium", "Swimming Pool", "24/7 Security", "Power Backup"],
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
                                        { id: "#1201", status: "Available", title: "2 BHK Premium", price: "₹1.48 Cr", area: "1,180 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                        { id: "#1202", status: "Booked", title: "3 BHK Premium", price: "₹1.86 Cr", area: "1,520 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
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
                                { id: "V-01", status: "Available", title: "3 BHK Villa", price: "₹2.78 Cr", area: "2,850 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "V-02", status: "Booked", title: "4 BHK Villa", price: "₹3.64 Cr", area: "3,200 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        }
                    ]
                },
                rowhouse: {
                    sections: [
                        {
                            rowLabel: "ROW 1",
                            units: [
                                { id: "R-01", status: "Available", title: "3 BHK Rowhouse", price: "₹2.62 Cr", area: "2,000 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "R-02", status: "Sold", title: "3 BHK Rowhouse", price: "₹2.71 Cr", area: "2,100 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
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
                                        { unit: "A-1201", meta: "Plot • 1200 sq.ft.", price: "₹54,00,000", status: "Available", active: true, icon: "checkmark-circle" },
                                        { unit: "A-1202", meta: "Plot • 1200 sq.ft.", price: "₹54,00,000", status: "Sold", active: false, icon: "lock-closed" }
                                    ]
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
                                { id: "S-01", status: "Available", title: "Retail Shop", area: "900 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "S-02", status: "Booked", title: "Cafe Space", area: "760 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        }
                    ]
                }
                , showroom: {
                    sections: [
                        {
                            rowLabel: "SECTION 1",
                            units: [
                                { id: "SR-01", status: "Available", title: "Showroom", area: "950 Sq.Ft", ctaLabel: "BLOCK", ctaVariant: "primary", actionIcon: "edit" },
                                { id: "SR-02", status: "Booked", title: "Showroom", area: "1,040 Sq.Ft", ctaLabel: "DETAILS", ctaVariant: "secondary", actionIcon: "edit" }
                            ]
                        }
                    ]
                }
            }
        }
    ]
};
