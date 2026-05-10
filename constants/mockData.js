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
            inventory: [
                {
                    floor: "14TH FLOOR",
                    units: [
                        { id: "1401", status: "Tokened" },
                        { id: "1402", status: "Tokened" },
                        { id: "1403", status: "Booked" },
                        { id: "1404", status: "Available", selected: true },
                        { id: "1405", status: "Available" },
                        { id: "1406", status: "Available" }
                    ]
                },
                {
                    floor: "12TH FLOOR",
                    units: [
                        { id: "1201", status: "Available" },
                        { id: "1202", status: "Available" },
                        { id: "1203", status: "Tokened" },
                        { id: "1204", status: "Sold" },
                        { id: "1205", status: "Available" },
                        { id: "1206", status: "Booked" },
                        { id: "1207", status: "Available" },
                        { id: "1208", status: "Available" }
                    ]
                },
                {
                    floor: "GROUND FLOOR (SHOPS)",
                    units: [
                        { id: "G01", type: "Retail", status: "Tokened" },
                        { id: "G02", type: "Cafe", status: "Available" },
                        { id: "G03", type: "Retail", status: "Tokened" },
                        { id: "G04", type: "Bank", status: "Available" }
                    ]
                }
            ]
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
            inventory: []
        }
    ]
};
