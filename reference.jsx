import React, { useState } from 'react';
import {
    Building2, User, MapPin, Image as ImageIcon, UploadCloud,
    FileText, CheckCircle2, ChevronDown, Plus, Download,
    LayoutGrid, Settings, CreditCard, AlertCircle, ChevronRight,
    Search, FileSpreadsheet, Home, Building, Map, CheckSquare,
    ArrowRight, Menu, X, Landmark, Briefcase, Zap, ShieldCheck,
    TrendingUp, Target, Percent, Layers, Maximize, Tag, a Trash2
} from 'lucide-react';

// --- SHARED PREMIUM UI COMPONENTS ---

const Card = ({ children, className = '', noPadding = false }) => (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
        {!noPadding && <div className="p-4 md:p-6">{children}</div>}
        {noPadding && children}
    </div>
);

const Label = ({ children, required }) => (
    <label className="block text-xs md:text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
        {children} {required && <span className="text-blue-600">*</span>}
    </label>
);

const Input = ({ label, required, className = '', icon: Icon, ...props }) => (
    <div className={className}>
        {label && <Label required={required}>{label}</Label>}
        <div className="relative group">
            {Icon && <Icon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />}
            <input
                className={`w-full py-2.5 md:py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium shadow-sm shadow-slate-200/20 ${Icon ? 'pl-10 pr-3' : 'px-4'}`}
                {...props}
            />
        </div>
    </div>
);

const Select = ({ label, required, options, className = '', defaultValue, value, onChange, ...props }) => (
    <div className={className}>
        {label && <Label required={required}>{label}</Label>}
        <div className="relative group">
            <select
                className="w-full px-4 py-2.5 md:py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none text-sm text-slate-800 appearance-none font-bold shadow-sm shadow-slate-200/20"
                defaultValue={value === undefined ? (defaultValue ?? "") : undefined}
                value={value}
                onChange={onChange}
                {...props}
            >
                <option value="" disabled>Select option...</option>
                {options.map((opt, i) => {
                    const val = typeof opt === 'object' ? opt.value : opt;
                    const lbl = typeof opt === 'object' ? opt.label : opt;
                    return <option key={i} value={val}>{lbl}</option>;
                })}
            </select>
            <ChevronDown className="absolute right-4 top-3 md:top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 pointer-events-none transition-colors" />
        </div>
    </div>
);

const TextArea = ({ label, required, className = '', ...props }) => (
    <div className={className}>
        {label && <Label required={required}>{label}</Label>}
        <textarea
            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none text-sm text-slate-800 placeholder:text-slate-400 resize-y font-medium shadow-sm shadow-slate-200/20"
            style={{ minHeight: '120px' }}
            {...props}
        />
    </div>
);

const FileUploadZone = ({ label, hint, multiple = false, icon: Icon = UploadCloud }) => (
    <div className="w-full">
        {label && <Label>{label}</Label>}
        <div className="mt-1 flex flex-col items-center justify-center px-4 py-6 md:px-6 md:pt-5 md:pb-6 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50/50 hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm shadow-slate-200/20">
            <div className="p-3 md:p-4 bg-white shadow-sm rounded-full mb-3 group-hover:scale-110 group-hover:shadow-md transition-all">
                <Icon className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
            </div>
            <div className="flex text-sm text-slate-600 justify-center font-medium">
                <span className="text-blue-600 group-hover:text-blue-700">Click to upload</span>
                <p className="pl-1 hidden sm:block">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500 mt-1">{hint || "PDF, PNG, JPG (Max 10MB)"}</p>
        </div>
    </div>
);

const Badge = ({ children, variant = 'gray' }) => {
    const variants = {
        gray: 'bg-slate-100 text-slate-700 border-slate-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        amber: 'bg-amber-50 text-amber-700 border-amber-200',
        indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${variants[variant]}`}>
            {children}
        </span>
    );
};

const SectionHeader = ({ title, description, icon: Icon }) => (
    <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-100">
        {Icon && (
            <div className="p-2.5 bg-blue-50 rounded-xl">
                <Icon className="h-5 w-5 text-blue-600" />
            </div>
        )}
        <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
    </div>
);

// --- STEP 1 & 2: BUILDER DETAILS ---

const StepBuilderProfile = () => (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Builder Master Profile</h2>
            <p className="text-slate-500 text-sm mt-1">Configure entity details, operations, and verified documents.</p>
        </div>

        <Card>
            <SectionHeader title="Entity Information" description="Official company registration details." icon={Building2} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Builder / Company Name" placeholder="Legal Entity Name" required />
                <Input label="Brand Name" placeholder="Marketing Name" />
                <Select label="Builder Type" required options={['Developer Company', 'Individual Builder', 'Land Owner + Developer', 'Channel Partner']} />

                <Input label="RERA Registration No." placeholder="State RERA ID" required />
                <Input label="GST Number" placeholder="GSTIN" required />
                <Input label="PAN Number" placeholder="Company PAN" required />

                <Input label="Established Year" type="number" placeholder="YYYY" />
                <Input label="Official Website" type="url" placeholder="https://" icon={Briefcase} />
                <TextArea label="About Builder" className="md:col-span-3" placeholder="Corporate history, vision, and scale of operations..." />
            </div>
        </Card>

        <Card>
            <SectionHeader title="Operational Details" description="Internal mapping and banking information." icon={User} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Select label="Assigned Relationship Manager" options={['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Unassigned']} defaultValue="Unassigned" />
                <Select label="Assigned Sales Manager" options={['Vikram Mehta', 'Neha Gupta', 'Unassigned']} defaultValue="Unassigned" />
                <Select label="Onboarding Source" options={['Direct Sales', 'Referral', 'Website Lead', 'Event', 'Other']} />

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="col-span-full text-sm font-bold text-slate-800">Banking Details (For Escrow/Payments)</h4>
                    <Input label="Account Name" />
                    <Input label="Account Number" />
                    <Input label="IFSC Code" />
                    <Input label="Bank Name" />
                </div>
            </div>
        </Card>

        <Card>
            <SectionHeader title="Compliance & Documents" description="Upload verified copies for RERA and Legal compliance." icon={ShieldCheck} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FileUploadZone label="Company Logo" hint="Transparent PNG (Min 500x500px)" icon={ImageIcon} />
                <FileUploadZone label="RERA Certificate" hint="Official PDF Document" icon={FileText} />
                <FileUploadZone label="GST & PAN" hint="Combined PDF" icon={FileText} />
            </div>
        </Card>
    </div>
);

// --- STEP 3 & 4: PROJECT HUB & INVENTORY ENGINE ---

const StepProjectEngine = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [projects, setProjects] = useState([
        { id: '1', name: 'SquarFT Horizon', type: 'Mixed Use', status: 'Active' },
        { id: '2', name: 'Omaxe IT Hub', type: 'Commercial', status: 'Draft' }
    ]);
    const [activeProjectId, setActiveProjectId] = useState('1');

    const activeProject = projects.find(p => p.id === activeProjectId);

    const handleAddProject = () => {
        const newProject = {
            id: Date.now().toString(),
            name: `New Project ${projects.length + 1}`,
            type: 'Residential',
            status: 'Draft'
        };
        setProjects([newProject, ...projects]);
        setActiveProjectId(newProject.id);
        setActiveTab('overview');
    };

    const tabs = [
        { id: 'overview', icon: FileText, label: 'Basic Info' },
        { id: 'location', icon: MapPin, label: 'Location' },
        { id: 'inventory', icon: LayoutGrid, label: 'Inventory Engine' },
        { id: 'amenities', icon: Zap, label: 'Amenities' },
        { id: 'pricing', icon: CreditCard, label: 'Pricing & Plans' },
        { id: 'media', icon: ImageIcon, label: 'Media & Docs' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Project Architecture</h2>
                    <p className="text-slate-500 text-sm mt-1">Design your nested project hierarchy, from towers to individual units.</p>
                </div>
                <button
                    onClick={handleAddProject}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20 w-full sm:w-auto justify-center active:scale-95"
                >
                    <Plus className="h-4 w-4" /> Add New Project
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row overflow-hidden" style={{ minHeight: '700px' }}>
                {/* Left Sidebar: Project List */}
                <div className="w-full lg:w-72 bg-slate-50 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Project Portfolio</h3>
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500" />
                            <input type="text" placeholder="Search projects..." className="w-full pl-9 pr-3 py-2 bg-slate-100 border-none rounded-xl text-sm focus:bg-blue-50/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                        </div>
                    </div>
                    <div className="p-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {projects.map((project) => {
                            const isActive = activeProjectId === project.id;
                            return (
                                <button
                                    key={project.id}
                                    onClick={() => setActiveProjectId(project.id)}
                                    className={`w-64 lg:w-full shrink-0 text-left p-3.5 rounded-xl transition-all relative overflow-hidden group ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-500'
                                        : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 shadow-sm'
                                        }`}
                                >
                                    {isActive && <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:scale-110 transition-transform"><Building2 className="h-16 w-16 -mt-4 -mr-4" /></div>}
                                    <div className="relative z-10">
                                        <h4 className="font-black text-sm lg:text-base truncate">{project.name}</h4>
                                        <p className={`text-xs mt-1 font-semibold tracking-wide uppercase ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                                            {project.type} • {project.status}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Workspace: Deep Configuration */}
                <div className="flex-1 flex flex-col min-w-0 bg-white">
                    <div className="flex overflow-x-auto bg-slate-50/50 p-2 lg:p-3 gap-2 sticky top-0 z-10 border-b border-slate-100" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 text-sm font-bold flex items-center gap-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id
                                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200 ring-1 ring-slate-900/5'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 border border-transparent'
                                    }`}
                            >
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 md:p-6 lg:p-8 overflow-y-auto flex-1 bg-slate-50/30">
                        {activeTab === 'overview' && <ProjectOverviewTab project={activeProject} />}
                        {activeTab === 'inventory' && <InventoryEngine />}
                        {activeTab === 'amenities' && <AmenitiesTab />}
                        {activeTab === 'pricing' && <PricingTab />}
                        {(activeTab === 'location' || activeTab === 'media') && (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                <Settings className="h-12 w-12 mb-4 opacity-20" />
                                <p>Standard data entry for {tabs.find(t => t.id === activeTab).label}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectOverviewTab = ({ project }) => (
    <div key={project?.id} className="space-y-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Project Name" defaultValue={project?.name || "SquarFT Horizon"} required />
            <Input label="Project Code" defaultValue={`SQ-PRJ-${project?.id?.slice(-3) || '001'}`} />
            <Select label="Project Type" defaultValue={project?.type || "Mixed Use"} options={['Residential', 'Commercial', 'Mixed Use', 'Plotting', 'Township', 'Villa Project']} />
            <Select label="Status" defaultValue={project?.status || "Under Construction"} options={['Draft', 'Upcoming', 'Under Construction', 'Ready to Move']} />

            <div className="grid grid-cols-2 gap-4">
                <Input label="Launch Date" type="date" />
                <Input label="Possession" type="date" />
            </div>
            <Input label="Project RERA Number" required />

            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                <Input label="Total Land Area" placeholder="Acres" />
                <Input label="Total Towers" type="number" />
                <Input label="Total Units" type="number" />
                <Input label="Phases" type="number" />
            </div>

            <TextArea label="Project Description" className="md:col-span-2" />
        </div>
    </div>
);

// THE CORE: Dynamic Inventory Engine
const InventoryEngine = () => {
    const [selectedTypes, setSelectedTypes] = useState(['Apartments']);

    const propTypes = [
        { id: 'Apartments', label: 'Apartments', icon: Building },
        { id: 'Plots', label: 'Plots', icon: Map },
        { id: 'Villas', label: 'Villas', icon: Home },
        { id: 'Commercial', label: 'Commercial Units', icon: Briefcase },
    ];

    const toggleType = (id) => {
        setSelectedTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    return (
        <div className="space-y-8">
            {/* Type Selector Menu */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Select Inventory Types for this Project</h3>
                <div className="flex flex-wrap gap-3">
                    {propTypes.map(pt => {
                        const isActive = selectedTypes.includes(pt.id);
                        return (
                            <button
                                key={pt.id}
                                onClick={() => toggleType(pt.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${isActive
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <pt.icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                                {pt.label}
                                {isActive && <CheckCircle2 className="h-4 w-4 ml-1 text-emerald-400" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dynamic Workspaces */}
            <div className="space-y-8">
                {selectedTypes.includes('Apartments') && <ApartmentConfigWorkspace />}
                {selectedTypes.includes('Plots') && <PlotConfigWorkspace />}
                {selectedTypes.includes('Villas') && <VillaConfigWorkspace />}
                {selectedTypes.includes('Commercial') && <CommercialConfigWorkspace />}

                {selectedTypes.length === 0 && (
                    <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                        <LayoutGrid className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Select an inventory type above to begin configuring properties.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- UPGRADED APARTMENT WORKSPACE (TOWER & VARIANTS MATRICES) ---
const ApartmentConfigWorkspace = () => {
    const [towers, setTowers] = useState([
        {
            id: 1,
            name: 'Tower A',
            floors: 8,
            unitsPerFloor: 4,
            configs: [
                { id: 'c1', type: '2 BHK', name: 'Type A (Standard)', area: 1150, price: '65,00,000', color: 'blue' },
                { id: 'c2', type: '2 BHK', name: 'Type B (Premium)', area: 1250, price: '72,00,000', color: 'indigo' },
                { id: 'c3', type: '3 BHK', name: 'Luxury Corner', area: 1550, price: '85,00,000', color: 'emerald' }
            ],
            // Maps floor_unit (e.g., "1_1") to configId
            unitMap: {
                '1_1': 'c1', '1_2': 'c2', '1_3': 'c2', '1_4': 'c1',
                '2_1': 'c1', '2_2': 'c2', '2_3': 'c2', '2_4': 'c1',
                '8_1': 'c3', '8_2': 'c3', '8_3': 'c3', '8_4': 'c3',
            },
            // Stores specific overrides for individual units
            unitOverrides: {
                '8_4': { customPrice: '95,00,000', customName: 'Penthouse View' } // Example of overridden unit
            }
        }
    ]);
    const [activeTowerId, setActiveTowerId] = useState(1);
    const [activeConfigId, setActiveConfigId] = useState('c1');
    const [gridMode, setGridMode] = useState('paint'); // 'paint' or 'edit'
    const [selectedUnitKey, setSelectedUnitKey] = useState(null); // Key of unit being edited

    const activeTower = towers.find(t => t.id === activeTowerId) || towers[0];

    const colorPalette = {
        blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-700', light: 'bg-blue-50' },
        emerald: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-emerald-700', light: 'bg-emerald-50' },
        purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-700', light: 'bg-purple-50' },
        amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-700', light: 'bg-amber-50' },
        rose: { bg: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-rose-700', light: 'bg-rose-50' },
    };

    const updateActiveTower = (updates) => {
        setTowers(towers.map(t => t.id === activeTowerId ? { ...t, ...updates } : t));
    };

    const handleAddTower = () => {
        const newTower = {
            id: Date.now(),
            name: `Tower ${String.fromCharCode(65 + towers.length)}`,
            floors: 5,
            unitsPerFloor: 4,
            configs: [
                { id: 'c1', type: '1 BHK', name: 'Standard', area: 1000, price: '50,00,000', color: 'blue' }
            ],
            unitMap: {},
            unitOverrides: {}
        };
        setTowers([...towers, newTower]);
        setActiveTowerId(newTower.id);
        setActiveConfigId('c1');
        setGridMode('paint');
    };

    const handleAddConfig = () => {
        const ObjectKeys = Object.keys(colorPalette);
        const usedColors = activeTower.configs.map(c => c.color);
        const availableColor = ObjectKeys.find(c => !usedColors.includes(c)) || ObjectKeys[0];

        const newConfig = {
            id: `c${Date.now()}`,
            type: '1 BHK',
            name: `New Variant`,
            area: 0,
            price: '0',
            color: availableColor
        };
        updateActiveTower({ configs: [...activeTower.configs, newConfig] });
    };

    const updateConfig = (configId, field, value) => {
        const updatedConfigs = activeTower.configs.map(c =>
            c.id === configId ? { ...c, [field]: value } : c
        );
        updateActiveTower({ configs: updatedConfigs });
    };

    const handleUnitClick = (floorNum, unitIndex) => {
        const key = `${floorNum}_${unitIndex}`;

        if (gridMode === 'paint') {
            if (!activeConfigId) return;
            const newMap = { ...activeTower.unitMap };
            const newOverrides = { ...(activeTower.unitOverrides || {}) };

            if (newMap[key] === activeConfigId) {
                delete newMap[key];
                delete newOverrides[key]; // clear override if unassigned
            } else {
                newMap[key] = activeConfigId;
                delete newOverrides[key]; // clear override if reassigned base
            }
            updateActiveTower({ unitMap: newMap, unitOverrides: newOverrides });
        } else {
            // Edit Mode
            setSelectedUnitKey(key);
        }
    };

    const applyConfigToEntireFloor = (floorNum) => {
        if (gridMode !== 'paint' || !activeConfigId) return;
        const newMap = { ...activeTower.unitMap };
        const newOverrides = { ...(activeTower.unitOverrides || {}) };

        for (let u = 1; u <= activeTower.unitsPerFloor; u++) {
            const key = `${floorNum}_${u}`;
            newMap[key] = activeConfigId;
            delete newOverrides[key]; // Clear specific overrides when painting entire floor
        }
        updateActiveTower({ unitMap: newMap, unitOverrides: newOverrides });
    };

    const handleUnitOverrideChange = (field, value) => {
        if (!selectedUnitKey) return;
        const currentOverrides = activeTower.unitOverrides || {};
        const unitOverride = currentOverrides[selectedUnitKey] || {};

        const newOverrides = {
            ...currentOverrides,
            [selectedUnitKey]: { ...unitOverride, [field]: value }
        };

        // If all overrides are cleared, remove the object
        if (!newOverrides[selectedUnitKey].customArea && !newOverrides[selectedUnitKey].customPrice && !newOverrides[selectedUnitKey].customName) {
            delete newOverrides[selectedUnitKey];
        }
        updateActiveTower({ unitOverrides: newOverrides });
    };

    // Generate Floor Rows Array (Reversed so Top floor is at the top of UI)
    const floorRows = Array.from({ length: activeTower.floors }, (_, i) => activeTower.floors - i);
    const unitsCols = Array.from({ length: activeTower.unitsPerFloor }, (_, i) => i + 1);

    return (
        <Card noPadding className="border-blue-200">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 rounded-lg text-white"><Building className="h-5 w-5" /></div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Visual Tower Builder</h3>
                        <p className="text-xs text-slate-600">Design your layout floor by floor. Paint units, then edit specific flats.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleAddTower}
                        className="bg-white text-blue-600 border border-blue-200 px-3 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-sm active:scale-95"
                    >
                        + Add Tower
                    </button>
                </div>
            </div>

            {/* Top Tower Tabs */}
            <div className="flex px-4 pt-4 border-b border-slate-100 gap-2 overflow-x-auto bg-slate-50/50" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {towers.map(tower => (
                    <button
                        key={tower.id}
                        onClick={() => { setActiveTowerId(tower.id); setSelectedUnitKey(null); }}
                        className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all border border-b-0 ${activeTowerId === tower.id
                            ? 'bg-white border-slate-200 text-blue-700 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10 relative'
                            : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        {tower.name}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row bg-white min-h-[600px] relative z-0">

                {/* LEFT PANEL: Setup & Palette / Editor */}
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 bg-slate-50/50 flex flex-col gap-6">

                    {/* Mode Switcher */}
                    <div className="flex p-1 bg-slate-200/80 rounded-xl shadow-inner">
                        <button
                            onClick={() => { setGridMode('paint'); setSelectedUnitKey(null); }}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${gridMode === 'paint' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            🖌️ Paint Mode
                        </button>
                        <button
                            onClick={() => setGridMode('edit')}
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${gridMode === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            ⚙️ Edit Specific Unit
                        </button>
                    </div>

                    {gridMode === 'paint' ? (
                        <>
                            {/* Tower Dimensions */}
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. Floor & Unit Limits</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Total Floors"
                                        type="number"
                                        value={activeTower.floors}
                                        onChange={(e) => updateActiveTower({ floors: parseInt(e.target.value) || 1 })}
                                    />
                                    <Input
                                        label="Units per Floor"
                                        type="number"
                                        value={activeTower.unitsPerFloor}
                                        onChange={(e) => updateActiveTower({ unitsPerFloor: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>

                            {/* Unit Palette */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Base Types (Palette)</h4>
                                    <button onClick={handleAddConfig} className="text-xs font-bold text-blue-600 hover:underline">+ New Type</button>
                                </div>

                                <div className="space-y-3 flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                    {activeTower.configs.map(config => {
                                        const isActive = activeConfigId === config.id;
                                        const colors = colorPalette[config.color] || colorPalette.blue;

                                        return (
                                            <div
                                                key={config.id}
                                                onClick={() => setActiveConfigId(config.id)}
                                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isActive ? `border-${config.color}-500 shadow-md ${colors.light}` : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-3 h-3 rounded-full shrink-0 shadow-inner ${colors.bg}`} />
                                                    <select
                                                        value={config.type}
                                                        onChange={(e) => updateConfig(config.id, 'type', e.target.value)}
                                                        className={`font-bold text-xs bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer ${isActive ? colors.text : 'text-slate-700'}`}
                                                        style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                                                    >
                                                        <option value="Studio">Studio</option>
                                                        <option value="1 Rk">1 RK</option>
                                                        <option value="1 BHK">1 BHK</option>
                                                        <option value="1.5 BHK">1.5 BHK</option>
                                                        <option value="2 BHK">2 BHK</option>
                                                        <option value="2.5 BHK">2.5 BHK</option>
                                                        <option value="3 BHK">3 BHK</option>
                                                        <option value="4 BHK">4 BHK</option>
                                                        <option value="5 BHK">5 BHK</option>
                                                        <option value="5+ BHK">5+ BHK</option>
                                                        <option value="Duplex">Duplex</option>
                                                        <option value="Penthouse">Penthouse</option>
                                                    </select>
                                                    <span className="text-slate-300 font-bold">-</span>
                                                    <input
                                                        type="text"
                                                        value={config.name}
                                                        onChange={(e) => updateConfig(config.id, 'name', e.target.value)}
                                                        className={`font-bold text-xs bg-transparent border-none outline-none focus:ring-0 p-0 w-full placeholder:text-slate-400 ${isActive ? colors.text : 'text-slate-600'}`}
                                                        placeholder="Variant (e.g. Type A)"
                                                    />
                                                    {isActive && <CheckCircle2 className={`h-4 w-4 ${colors.text} opacity-50 shrink-0`} />}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <input
                                                        type="number" value={config.area} onChange={(e) => updateConfig(config.id, 'area', e.target.value)}
                                                        className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-blue-400 bg-white" placeholder="Area (sqft)"
                                                    />
                                                    <input
                                                        type="text" value={config.price} onChange={(e) => updateConfig(config.id, 'price', e.target.value)}
                                                        className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-blue-400 bg-white" placeholder="Price (₹)"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Unit Customization</h4>

                            {!selectedUnitKey ? (
                                <div className="flex flex-col items-center justify-center p-8 bg-slate-100 rounded-xl border border-slate-200 border-dashed text-center flex-1">
                                    <Settings className="h-8 w-8 text-slate-300 mb-3" />
                                    <p className="text-sm font-semibold text-slate-500">Click a specific unit on the grid to override its details.</p>
                                </div>
                            ) : (
                                <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                    {(() => {
                                        const [fNum, uIdx] = selectedUnitKey.split('_');
                                        const flatNum = `${fNum}${uIdx.padStart(2, '0')}`;
                                        const baseConfId = activeTower.unitMap[selectedUnitKey];
                                        const baseConf = activeTower.configs.find(c => c.id === baseConfId);
                                        const overrides = activeTower.unitOverrides?.[selectedUnitKey] || {};

                                        if (!baseConf) return (
                                            <div className="text-center py-4 text-slate-500 text-sm font-medium">
                                                Please assign a base type (Paint) to this unit first.
                                            </div>
                                        );

                                        return (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                                    <div>
                                                        <h5 className="font-black text-slate-900 text-lg">Flat {flatNum}</h5>
                                                        <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                                            Base: {baseConf.type} - {baseConf.name}
                                                        </p>
                                                    </div>
                                                    {Object.keys(overrides).length > 0 && (
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-100 px-2 py-1 rounded-md">Modified</span>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <Input
                                                        label="Custom Name / Tag"
                                                        placeholder={`Base: ${baseConf.name}`}
                                                        value={overrides.customName || ''}
                                                        onChange={(e) => handleUnitOverrideChange('customName', e.target.value)}
                                                    />
                                                    <Input
                                                        label="Override Area (sqft)"
                                                        type="number"
                                                        placeholder={`Base: ${baseConf.area}`}
                                                        value={overrides.customArea || ''}
                                                        onChange={(e) => handleUnitOverrideChange('customArea', e.target.value)}
                                                    />
                                                    <Input
                                                        label="Override Price (₹)"
                                                        placeholder={`Base: ${baseConf.price}`}
                                                        value={overrides.customPrice || ''}
                                                        onChange={(e) => handleUnitOverrideChange('customPrice', e.target.value)}
                                                    />
                                                </div>

                                                <p className="text-[10px] text-slate-400 font-medium leading-tight mt-2">
                                                    Leave fields blank to inherit from the base configuration. Modifications are marked with a <span className="text-amber-500 font-bold">*</span> on the grid.
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL: Visual Interactive Grid */}
                <div className="w-full lg:w-2/3 p-6 bg-slate-100/50 overflow-auto relative flex justify-center">

                    {/* Visual Grid Container */}
                    <div className="inline-block bg-white p-6 rounded-2xl shadow-sm border border-slate-200">

                        {/* Building Roof Decoration */}
                        <div className="w-full h-8 bg-slate-800 rounded-t-xl mb-1 flex items-center justify-center border-b-4 border-slate-900 shadow-inner">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeTower.name} ROOFTOP</span>
                        </div>

                        <div className="space-y-1.5">
                            {floorRows.map(floorNum => (
                                <div key={floorNum} className="flex gap-2 items-center group">

                                    {/* Floor Label & Quick Select */}
                                    <div
                                        className={`w-16 h-12 flex flex-col justify-center items-center rounded-lg border shrink-0 transition-colors ${gridMode === 'paint' ? 'bg-slate-100 cursor-pointer hover:bg-slate-200 border-slate-200' : 'bg-slate-50 border-transparent opacity-50'}`}
                                        onClick={() => applyConfigToEntireFloor(floorNum)}
                                        title={gridMode === 'paint' ? "Apply active type to entire floor" : "Floor " + floorNum}
                                    >
                                        <span className="text-xs font-black text-slate-600">FL {floorNum}</span>
                                        {gridMode === 'paint' && <span className="text-[9px] font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Select All</span>}
                                    </div>

                                    {/* Units on this Floor */}
                                    <div className="flex gap-1.5 flex-1">
                                        {unitsCols.map(unitIndex => {
                                            const key = `${floorNum}_${unitIndex}`;
                                            const assignedConfigId = activeTower.unitMap[key];
                                            const config = activeTower.configs.find(c => c.id === assignedConfigId);
                                            const override = activeTower.unitOverrides?.[key];
                                            const hasOverride = override && Object.keys(override).length > 0;

                                            const displayNum = `${floorNum}${unitIndex.toString().padStart(2, '0')}`;
                                            const paintColor = config ? (colorPalette[config.color]?.bg || 'bg-slate-500') : '';
                                            const isEditing = gridMode === 'edit' && selectedUnitKey === key;

                                            const finalName = override?.customName || config?.name;

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => handleUnitClick(floorNum, unitIndex)}
                                                    className={`h-12 flex-1 rounded-lg border-2 transition-all flex flex-col justify-center items-center relative overflow-hidden group/unit min-w-[60px] ${config
                                                        ? `${paintColor} text-white shadow-sm hover:brightness-110 ${isEditing ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 z-10' : 'border-transparent'}`
                                                        : `bg-white border-dashed text-slate-400 ${isEditing ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-400/20 scale-105 z-10' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50'}`
                                                        } ${gridMode === 'edit' && !isEditing ? 'opacity-70 hover:opacity-100' : ''}`}
                                                >
                                                    {/* Hover overlay hint (Paint mode) */}
                                                    {!config && gridMode === 'paint' && activeConfigId && (
                                                        <div className={`absolute inset-0 opacity-0 group-hover/unit:opacity-20 transition-opacity ${colorPalette[activeTower.configs.find(c => c.id === activeConfigId)?.color || 'blue']?.bg || 'bg-blue-500'}`} />
                                                    )}

                                                    {/* Override Indicator */}
                                                    {hasOverride && (
                                                        <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 text-amber-900 rounded-bl-md flex items-center justify-center">
                                                            <span className="text-[8px] font-black leading-none mb-px">*</span>
                                                        </div>
                                                    )}

                                                    <span className={`text-[10px] sm:text-xs font-black ${config ? 'text-white' : ''}`}>
                                                        {displayNum}
                                                    </span>
                                                    {config && (
                                                        <span className="text-[8px] font-bold opacity-90 uppercase tracking-wider truncate px-1 max-w-full text-center leading-tight mt-0.5">
                                                            {config.type}<br />
                                                            <span className="opacity-75 font-medium text-[7px]">{finalName}</span>
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Building Base Decoration */}
                        <div className="w-full h-4 bg-slate-300 rounded-b-md mt-1 border-t border-slate-400"></div>

                    </div>
                </div>
            </div>
        </Card>
    );
};


// --- PLOTS WORKSPACE (VISUAL GRID) ---
const PlotConfigWorkspace = () => {
    const [blocks, setBlocks] = useState([
        {
            id: 1,
            name: 'Sector A',
            rows: 5,
            plotsPerRow: 8,
            configs: [
                { id: 'p1', type: 'Standard Plot', name: 'Regular', area: 150, price: '45,00,000', color: 'emerald' },
                { id: 'p2', type: 'Corner Plot', name: 'Premium (2-Side Open)', area: 180, price: '60,00,000', color: 'amber' }
            ],
            unitMap: {},
            unitOverrides: {}
        }
    ]);
    const [activeBlockId, setActiveBlockId] = useState(1);
    const [activeConfigId, setActiveConfigId] = useState('p1');
    const [gridMode, setGridMode] = useState('paint');
    const [selectedUnitKey, setSelectedUnitKey] = useState(null);

    const activeBlock = blocks.find(b => b.id === activeBlockId) || blocks[0];

    const colorPalette = {
        emerald: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-emerald-700', light: 'bg-emerald-50' },
        amber: { bg: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-700', light: 'bg-amber-50' },
        blue: { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-700', light: 'bg-blue-50' },
        purple: { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', text: 'text-purple-700', light: 'bg-purple-50' },
    };

    const updateActiveBlock = (updates) => {
        setBlocks(blocks.map(b => b.id === activeBlockId ? { ...b, ...updates } : b));
    };

    const handleAddBlock = () => {
        const newBlock = {
            id: Date.now(),
            name: `Sector ${String.fromCharCode(65 + blocks.length)}`,
            rows: 4, plotsPerRow: 6,
            configs: [{ id: 'p1', type: 'Standard Plot', name: 'Regular', area: 100, price: '20,00,000', color: 'emerald' }],
            unitMap: {}, unitOverrides: {}
        };
        setBlocks([...blocks, newBlock]);
        setActiveBlockId(newBlock.id);
        setActiveConfigId('p1');
        setGridMode('paint');
    };

    const handleAddConfig = () => {
        const ObjectKeys = Object.keys(colorPalette);
        const usedColors = activeBlock.configs.map(c => c.color);
        const availableColor = ObjectKeys.find(c => !usedColors.includes(c)) || ObjectKeys[0];

        const newConfig = { id: `c${Date.now()}`, type: 'Standard Plot', name: `New Variant`, area: 0, price: '0', color: availableColor };
        updateActiveBlock({ configs: [...activeBlock.configs, newConfig] });
    };

    const updateConfig = (configId, field, value) => {
        updateActiveBlock({ configs: activeBlock.configs.map(c => c.id === configId ? { ...c, [field]: value } : c) });
    };

    const handleUnitClick = (rowNum, plotIndex) => {
        const key = `${rowNum}_${plotIndex}`;
        if (gridMode === 'paint') {
            if (!activeConfigId) return;
            const newMap = { ...activeBlock.unitMap };
            const newOverrides = { ...(activeBlock.unitOverrides || {}) };

            if (newMap[key] === activeConfigId) { delete newMap[key]; delete newOverrides[key]; }
            else { newMap[key] = activeConfigId; delete newOverrides[key]; }
            updateActiveBlock({ unitMap: newMap, unitOverrides: newOverrides });
        } else {
            setSelectedUnitKey(key);
        }
    };

    const applyConfigToEntireRow = (rowNum) => {
        if (gridMode !== 'paint' || !activeConfigId) return;
        const newMap = { ...activeBlock.unitMap };
        const newOverrides = { ...(activeBlock.unitOverrides || {}) };
        for (let u = 1; u <= activeBlock.plotsPerRow; u++) {
            const key = `${rowNum}_${u}`;
            newMap[key] = activeConfigId;
            delete newOverrides[key];
        }
        updateActiveBlock({ unitMap: newMap, unitOverrides: newOverrides });
    };

    const handleUnitOverrideChange = (field, value) => {
        if (!selectedUnitKey) return;
        const currentOverrides = activeBlock.unitOverrides || {};
        const unitOverride = currentOverrides[selectedUnitKey] || {};
        const newOverrides = { ...currentOverrides, [selectedUnitKey]: { ...unitOverride, [field]: value } };
        if (!newOverrides[selectedUnitKey].customArea && !newOverrides[selectedUnitKey].customPrice && !newOverrides[selectedUnitKey].customName) {
            delete newOverrides[selectedUnitKey];
        }
        updateActiveBlock({ unitOverrides: newOverrides });
    };

    const rowArray = Array.from({ length: activeBlock.rows }, (_, i) => i + 1);
    const plotsCols = Array.from({ length: activeBlock.plotsPerRow }, (_, i) => i + 1);

    return (
        <Card noPadding className="border-emerald-200">
            <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600 rounded-lg text-white"><Map className="h-5 w-5" /></div>
                    <div><h3 className="font-bold text-slate-900 text-lg">Plotting Visual Matrix</h3><p className="text-xs text-slate-600">Map out blocks, plot rows, and assign categories.</p></div>
                </div>
                <button onClick={handleAddBlock} className="bg-white text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-emerald-50 shadow-sm active:scale-95">
                    + Add Sector
                </button>
            </div>

            <div className="flex px-4 pt-4 border-b border-slate-100 gap-2 overflow-x-auto bg-slate-50/50">
                {blocks.map(block => (
                    <button key={block.id} onClick={() => { setActiveBlockId(block.id); setSelectedUnitKey(null); }} className={`px-5 py-2.5 rounded-t-xl font-bold text-sm transition-all border border-b-0 ${activeBlockId === block.id ? 'bg-white border-slate-200 text-emerald-700 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] z-10 relative' : 'bg-slate-100 border-transparent text-slate-500 hover:text-slate-800'}`}>
                        {block.name}
                    </button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row bg-white min-h-[500px]">
                {/* LEFT PANEL */}
                <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-200 p-6 bg-slate-50/50 flex flex-col gap-6">
                    <div className="flex p-1 bg-slate-200/80 rounded-xl shadow-inner">
                        <button onClick={() => { setGridMode('paint'); setSelectedUnitKey(null); }} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${gridMode === 'paint' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>🖌️ Paint</button>
                        <button onClick={() => setGridMode('edit')} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${gridMode === 'edit' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>⚙️ Edit Plot</button>
                    </div>

                    {gridMode === 'paint' ? (
                        <>
                            <div>
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">1. Block Layout</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Total Rows" type="number" value={activeBlock.rows} onChange={(e) => updateActiveBlock({ rows: parseInt(e.target.value) || 1 })} />
                                    <Input label="Plots per Row" type="number" value={activeBlock.plotsPerRow} onChange={(e) => updateActiveBlock({ plotsPerRow: parseInt(e.target.value) || 1 })} />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">2. Plot Categories</h4>
                                    <button onClick={handleAddConfig} className="text-xs font-bold text-emerald-600 hover:underline">+ New Type</button>
                                </div>
                                <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                                    {activeBlock.configs.map(config => {
                                        const isActive = activeConfigId === config.id;
                                        const colors = colorPalette[config.color] || colorPalette.emerald;
                                        return (
                                            <div key={config.id} onClick={() => setActiveConfigId(config.id)} className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${isActive ? `border-${config.color}-500 shadow-md ${colors.light}` : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-3 h-3 rounded-full shrink-0 shadow-inner ${colors.bg}`} />
                                                    <select value={config.type} onChange={(e) => updateConfig(config.id, 'type', e.target.value)} className={`font-bold text-xs bg-transparent border-none outline-none focus:ring-0 p-0 cursor-pointer ${isActive ? colors.text : 'text-slate-700'}`}>
                                                        <option value="Standard Plot">Standard Plot</option>
                                                        <option value="Corner Plot">Corner Plot</option>
                                                        <option value="Park Facing">Park Facing</option>
                                                        <option value="Commercial Plot">Commercial Plot</option>
                                                    </select>
                                                    <span className="text-slate-300 font-bold">-</span>
                                                    <input type="text" value={config.name} onChange={(e) => updateConfig(config.id, 'name', e.target.value)} className={`font-bold text-xs bg-transparent border-none outline-none focus:ring-0 p-0 w-full placeholder:text-slate-400 ${isActive ? colors.text : 'text-slate-600'}`} placeholder="Variant" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <input type="number" value={config.area} onChange={(e) => updateConfig(config.id, 'area', e.target.value)} className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-emerald-400 bg-white" placeholder="Area (sq.yd)" />
                                                    <input type="text" value={config.price} onChange={(e) => updateConfig(config.id, 'price', e.target.value)} className="text-xs p-1.5 border border-slate-200 rounded outline-none focus:border-emerald-400 bg-white" placeholder="Price (₹)" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Plot Customization</h4>
                            {!selectedUnitKey ? (
                                <div className="flex flex-col items-center justify-center p-8 bg-slate-100 rounded-xl border border-slate-200 border-dashed text-center flex-1">
                                    <Settings className="h-8 w-8 text-slate-300 mb-3" />
                                    <p className="text-sm font-semibold text-slate-500">Click a specific plot on the grid to override its details.</p>
                                </div>
                            ) : (
                                <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                    {(() => {
                                        const [rNum, pIdx] = selectedUnitKey.split('_');
                                        const plotNum = `P-${rNum}${pIdx.padStart(2, '0')}`;
                                        const baseConfId = activeBlock.unitMap[selectedUnitKey];
                                        const baseConf = activeBlock.configs.find(c => c.id === baseConfId);
                                        const overrides = activeBlock.unitOverrides?.[selectedUnitKey] || {};

                                        if (!baseConf) return <div className="text-center py-4 text-slate-500 text-sm font-medium">Please assign a base type first.</div>;

                                        return (
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                                                    <div>
                                                        <h5 className="font-black text-slate-900 text-lg">Plot {plotNum}</h5>
                                                        <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">Base: {baseConf.type}</p>
                                                    </div>
                                                    {Object.keys(overrides).length > 0 && <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-100 px-2 py-1 rounded-md">Modified</span>}
                                                </div>
                                                <div className="space-y-3">
                                                    <Input label="Custom Tag / PLC" placeholder={`Base: ${baseConf.name}`} value={overrides.customName || ''} onChange={(e) => handleUnitOverrideChange('customName', e.target.value)} />
                                                    <Input label="Override Area (sq.yd)" type="number" placeholder={`Base: ${baseConf.area}`} value={overrides.customArea || ''} onChange={(e) => handleUnitOverrideChange('customArea', e.target.value)} />
                                                    <Input label="Override Price (₹)" placeholder={`Base: ${baseConf.price}`} value={overrides.customPrice || ''} onChange={(e) => handleUnitOverrideChange('customPrice', e.target.value)} />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL - GRID */}
                <div className="w-full lg:w-2/3 p-6 bg-slate-100/50 overflow-auto relative flex justify-center">
                    <div className="inline-block bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="w-full py-2 bg-slate-200 rounded-t-xl mb-4 text-center border-b border-slate-300">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeBlock.name} - MAIN ROAD</span>
                        </div>
                        <div className="space-y-3">
                            {rowArray.map(rowNum => (
                                <div key={rowNum} className="flex gap-3 items-center group">
                                    <div className={`w-16 h-12 flex flex-col justify-center items-center rounded-lg border shrink-0 transition-colors ${gridMode === 'paint' ? 'bg-slate-100 cursor-pointer hover:bg-slate-200 border-slate-200' : 'bg-slate-50 border-transparent opacity-50'}`} onClick={() => applyConfigToEntireRow(rowNum)}>
                                        <span className="text-xs font-black text-slate-600">ROW {rowNum}</span>
                                        {gridMode === 'paint' && <span className="text-[9px] font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">Select All</span>}
                                    </div>
                                    <div className="flex gap-2 flex-1">
                                        {plotsCols.map(plotIndex => {
                                            const key = `${rowNum}_${plotIndex}`;
                                            const assignedConfigId = activeBlock.unitMap[key];
                                            const config = activeBlock.configs.find(c => c.id === assignedConfigId);
                                            const override = activeBlock.unitOverrides?.[key];
                                            const hasOverride = override && Object.keys(override).length > 0;

                                            const displayNum = `${rowNum}${plotIndex.toString().padStart(2, '0')}`;
                                            const paintColor = config ? (colorPalette[config.color]?.bg || 'bg-slate-500') : '';
                                            const isEditing = gridMode === 'edit' && selectedUnitKey === key;
                                            const finalName = override?.customName || config?.name;

                                            return (
                                                <button key={key} onClick={() => handleUnitClick(rowNum, plotIndex)}
                                                    className={`w-14 h-14 flex-1 rounded-sm border-2 transition-all flex flex-col justify-center items-center relative overflow-hidden group/unit min-w-[56px] ${config ? `${paintColor} text-white shadow-sm hover:brightness-110 ${isEditing ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 z-10' : 'border-slate-900/10'}`
                                                        : `bg-slate-50 border-dashed text-slate-400 ${isEditing ? 'border-emerald-400 bg-emerald-50 ring-2 ring-emerald-400/20 scale-105 z-10' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100'}`
                                                        } ${gridMode === 'edit' && !isEditing ? 'opacity-70 hover:opacity-100' : ''}`}
                                                >
                                                    {hasOverride && <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 text-amber-900 flex items-center justify-center"><span className="text-[8px] font-black leading-none mb-px">*</span></div>}
                                                    <span className={`text-[10px] font-black ${config ? 'text-white' : ''}`}>P-{displayNum}</span>
                                                    {config && <span className="text-[7px] font-bold opacity-90 uppercase tracking-wider truncate px-1 max-w-full text-center leading-tight mt-0.5">{finalName}</span>}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// --- VILLAS WORKSPACE (VISUAL GRID) ---
const VillaConfigWorkspace = () => {
    const [phases, setPhases] = useState([
        {
            id: 1,
            name: 'Phase 1 (Luxury)',
            lanes: 4,
            villasPerLane: 5,
            configs: [
                { id: 'v1', type: '3 BHK Villa', name: 'Standard', area: 2500, price: '1,50,00,000', color: 'purple' },
                { id: 'v2', type: '4 BHK Signature', name: 'With Pool', area: 3500, price: '2,20,00,000', color: 'rose' }
            ],
            unitMap: {}, unitOverrides: {}
        }
    ]);
    const [activePhaseId, setActivePhaseId] = useState(1);
    const [activeConfigId, setActiveConfigId] = useState('v1');
    const [gridMode, setGridMode] = useState('paint');
    const [selectedUnitKey, setSelectedUnitKey] = useState(null);

    const activePhase = phases.find(p => p.id === activePhaseId) || phases[0];

    const colorPalette = {
        purple: { bg: 'bg-purple-500', hover: 'bg-purple-600', text: 'text-purple-700', light: 'bg-purple-50' },
        rose: { bg: 'bg-rose-500', hover: 'bg-rose-600', text: 'text-rose-700', light: 'bg-rose-50' },
        indigo: { bg: 'bg-indigo-500', hover: 'bg-indigo-600', text: 'text-indigo-700', light: 'bg-indigo-50' },
    };

    const updateActivePhase = (updates) => setPhases(phases.map(p => p.id === activePhaseId ? { ...p, ...updates } : p));

    const handleAddPhase = () => {
        const newPhase = {
            id: Date.now(), name: `Phase ${phases.length + 1}`, lanes: 3, villasPerLane: 4,
            configs: [{ id: 'v1', type: '3 BHK Villa', name: 'Standard', area: 2000, price: '1Cr', color: 'purple' }],
            unitMap: {}, unitOverrides: {}
        };
        setPhases([...phases, newPhase]); setActivePhaseId(newPhase.id); setActiveConfigId('v1'); setGridMode('paint');
    };

    const handleAddConfig = () => {
        const newConfig = { id: `c${Date.now()}`, type: '3 BHK Villa', name: `New Variant`, area: 0, price: '0', color: 'indigo' };
        updateActivePhase({ configs: [...activePhase.configs, newConfig] });
    };

    const updateConfig = (cId, field, val) => updateActivePhase({ configs: activePhase.configs.map(c => c.id === cId ? { ...c, [field]: val } : c) });

    const handleUnitClick = (lane, villa) => {
        const key = `${lane}_${villa}`;
        if (gridMode === 'paint') {
            if (!activeConfigId) return;
            const newMap = { ...activePhase.unitMap };
            if (newMap[key] === activeConfigId) delete newMap[key]; else newMap[key] = activeConfigId;
            updateActivePhase({ unitMap: newMap });
        } else { setSelectedUnitKey(key); }
    };

    const applyConfigToEntireLane = (lane) => {
        if (gridMode !== 'paint' || !activeConfigId) return;
        const newMap = { ...activePhase.unitMap };
        for (let u = 1; u <= activePhase.villasPerLane; u++) newMap[`${lane}_${u}`] = activeConfigId;
        updateActivePhase({ unitMap: newMap });
    };

    const rowArray = Array.from({ length: activePhase.lanes }, (_, i) => i + 1);
    const villasCols = Array.from({ length: activePhase.villasPerLane }, (_, i) => i + 1);

    return (
        <Card noPadding className="border-purple-200">
            <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-600 rounded-lg text-white"><Home className="h-5 w-5" /></div>
                    <div><h3 className="font-bold text-slate-900 text-lg">Villa Community Builder</h3><p className="text-xs text-slate-600">Layout independent structures along streets.</p></div>
                </div>
                <button onClick={handleAddPhase} className="bg-white text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl text-sm font-bold shadow-sm">+ Add Phase</button>
            </div>

            <div className="flex px-4 pt-4 border-b border-slate-100 gap-2 bg-slate-50/50">
                {phases.map(p => (
                    <button key={p.id} onClick={() => { setActivePhaseId(p.id); setSelectedUnitKey(null); }} className={`px-5 py-2.5 rounded-t-xl font-bold text-sm ${activePhaseId === p.id ? 'bg-white border-slate-200 text-purple-700 z-10 relative' : 'bg-slate-100 text-slate-500'}`}>{p.name}</button>
                ))}
            </div>

            <div className="flex flex-col lg:flex-row bg-white min-h-[500px]">
                {/* LEFT PANEL */}
                <div className="w-full lg:w-1/3 border-b lg:border-r border-slate-200 p-6 bg-slate-50/50 flex flex-col gap-6">
                    <div className="flex p-1 bg-slate-200/80 rounded-xl">
                        <button onClick={() => { setGridMode('paint'); setSelectedUnitKey(null); }} className={`flex-1 py-2 text-xs font-black uppercase rounded-lg ${gridMode === 'paint' ? 'bg-white text-purple-600' : 'text-slate-500'}`}>🖌️ Paint</button>
                        <button onClick={() => setGridMode('edit')} className={`flex-1 py-2 text-xs font-black uppercase rounded-lg ${gridMode === 'edit' ? 'bg-white text-purple-600' : 'text-slate-500'}`}>⚙️ Edit Villa</button>
                    </div>

                    {gridMode === 'paint' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Total Streets/Lanes" type="number" value={activePhase.lanes} onChange={(e) => updateActivePhase({ lanes: parseInt(e.target.value) || 1 })} />
                                <Input label="Villas per Lane" type="number" value={activePhase.villasPerLane} onChange={(e) => updateActivePhase({ villasPerLane: parseInt(e.target.value) || 1 })} />
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3">
                                <div className="flex justify-between items-center"><h4 className="text-xs font-black text-slate-400 uppercase">Villa Types</h4><button onClick={handleAddConfig} className="text-xs text-purple-600 font-bold">+ Type</button></div>
                                {activePhase.configs.map(config => {
                                    const isActive = activeConfigId === config.id;
                                    const colors = colorPalette[config.color] || colorPalette.purple;
                                    return (
                                        <div key={config.id} onClick={() => setActiveConfigId(config.id)} className={`p-3 rounded-xl border-2 cursor-pointer ${isActive ? `border-${config.color}-500 ${colors.light}` : 'border-slate-200 bg-white'}`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <select value={config.type} onChange={(e) => updateConfig(config.id, 'type', e.target.value)} className={`font-bold text-xs bg-transparent border-none p-0 cursor-pointer ${isActive ? colors.text : 'text-slate-700'}`}>
                                                    <option>2 BHK Villa</option><option>3 BHK Villa</option><option>4 BHK Signature</option><option>5+ BHK Mansion</option>
                                                </select>
                                                <input type="text" value={config.name} onChange={(e) => updateConfig(config.id, 'name', e.target.value)} className={`font-bold text-xs bg-transparent border-none p-0 w-full`} placeholder="Variant" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <input type="number" value={config.area} onChange={(e) => updateConfig(config.id, 'area', e.target.value)} className="text-xs p-1.5 border border-slate-200 rounded" placeholder="Built Area (sqft)" />
                                                <input type="text" value={config.price} onChange={(e) => updateConfig(config.id, 'price', e.target.value)} className="text-xs p-1.5 border border-slate-200 rounded" placeholder="Price (₹)" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-100 rounded-xl text-center border-dashed border">
                            <Settings className="h-8 w-8 text-slate-300 mb-3" />
                            <p className="text-sm font-semibold text-slate-500">Click a specific villa to edit.</p>
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL - GRID */}
                <div className="w-full lg:w-2/3 p-6 bg-slate-100/50 overflow-auto flex justify-center">
                    <div className="inline-block bg-white p-6 rounded-2xl border border-slate-200">
                        <div className="space-y-4">
                            {rowArray.map(lane => (
                                <div key={lane} className="flex gap-4 items-center group">
                                    <div className="w-16 h-16 flex flex-col justify-center items-center rounded-xl bg-slate-100 cursor-pointer hover:bg-slate-200" onClick={() => applyConfigToEntireLane(lane)}>
                                        <span className="text-xs font-black text-slate-600">LANE {lane}</span>
                                    </div>
                                    <div className="flex gap-3 flex-1">
                                        {villasCols.map(villa => {
                                            const key = `${lane}_${villa}`;
                                            const configId = activePhase.unitMap[key];
                                            const config = activePhase.configs.find(c => c.id === configId);
                                            const paint = config ? (colorPalette[config.color]?.bg || 'bg-slate-500') : 'bg-slate-50 border-dashed border-2 border-slate-300';
                                            return (
                                                <button key={key} onClick={() => handleUnitClick(lane, villa)} className={`w-16 h-16 rounded-xl flex flex-col justify-center items-center shadow-sm relative ${paint} ${gridMode === 'edit' && selectedUnitKey === key ? 'ring-4 ring-amber-400 scale-105 z-10' : ''}`}>
                                                    {config && <Home className="h-5 w-5 text-white/50 absolute top-2" />}
                                                    <span className={`text-xs font-black z-10 mt-3 ${config ? 'text-white' : 'text-slate-400'}`}>V-{lane}{villa}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// --- ADVANCED COMMERCIAL MODULE (VISUAL GRID) ---
const CommercialConfigWorkspace = () => {
    const [buildings, setBuildings] = useState([
        {
            id: 1, name: 'IT Hub - Tower 1', floors: 4, unitsPerFloor: 6,
            configs: [
                { id: 'c1', type: 'Retail Shop', name: 'Ground Frontage', area: 500, price: '1.2Cr', color: 'indigo' },
                { id: 'c2', type: 'Office Space', name: 'Bare Shell', area: 1200, price: '85L', color: 'blue' }
            ],
            unitMap: { '1_1': 'c1', '1_2': 'c1', '2_1': 'c2', '2_2': 'c2' }, unitOverrides: {}
        }
    ]);
    const [activeId, setActiveId] = useState(1);
    const [activeConfigId, setActiveConfigId] = useState('c1');
    const [gridMode, setGridMode] = useState('paint');

    const activeBuilding = buildings.find(b => b.id === activeId) || buildings[0];

    const updateActive = (updates) => setBuildings(buildings.map(b => b.id === activeId ? { ...b, ...updates } : b));

    const handleUnitClick = (flr, unit) => {
        const key = `${flr}_${unit}`;
        if (gridMode === 'paint') {
            if (!activeConfigId) return;
            const newMap = { ...activeBuilding.unitMap };
            if (newMap[key] === activeConfigId) delete newMap[key]; else newMap[key] = activeConfigId;
            updateActive({ unitMap: newMap });
        }
    };

    const flrRows = Array.from({ length: activeBuilding.floors }, (_, i) => activeBuilding.floors - i);
    const unitsCols = Array.from({ length: activeBuilding.unitsPerFloor }, (_, i) => i + 1);

    return (
        <Card noPadding className="border-indigo-200">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg text-white"><Briefcase className="h-5 w-5" /></div>
                <div><h3 className="font-bold text-slate-900 text-lg">Commercial Matrix</h3></div>
            </div>

            <div className="flex flex-col lg:flex-row bg-white min-h-[500px]">
                {/* LEFT PANEL */}
                <div className="w-full lg:w-1/3 border-r border-slate-200 p-6 bg-slate-50/50 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Floors" type="number" value={activeBuilding.floors} onChange={(e) => updateActive({ floors: parseInt(e.target.value) || 1 })} />
                        <Input label="Units/Floor" type="number" value={activeBuilding.unitsPerFloor} onChange={(e) => updateActive({ unitsPerFloor: parseInt(e.target.value) || 1 })} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center"><h4 className="text-xs font-black text-slate-400 uppercase">Commercial Types</h4></div>
                        {activeBuilding.configs.map(config => (
                            <div key={config.id} onClick={() => setActiveConfigId(config.id)} className={`p-3 rounded-xl border-2 cursor-pointer ${activeConfigId === config.id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                                <div className="font-bold text-xs text-indigo-700">{config.type} - {config.name}</div>
                                <div className="text-xs text-slate-500 mt-1">{config.area} sqft | {config.price}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT PANEL - GRID */}
                <div className="w-full lg:w-2/3 p-6 bg-slate-100/50 flex justify-center">
                    <div className="inline-block bg-white p-6 rounded-2xl border border-slate-200">
                        <div className="w-full h-6 bg-slate-800 rounded-t-xl mb-1 flex items-center justify-center">
                            <span className="text-[9px] font-black text-slate-400 uppercase">{activeBuilding.name} ROOF</span>
                        </div>
                        <div className="space-y-1.5">
                            {flrRows.map(flr => (
                                <div key={flr} className="flex gap-2 items-center">
                                    <div className="w-12 h-10 flex items-center justify-center rounded-md bg-slate-100 text-[10px] font-black text-slate-500">F{flr}</div>
                                    <div className="flex gap-1.5">
                                        {unitsCols.map(u => {
                                            const key = `${flr}_${u}`;
                                            const c = activeBuilding.configs.find(conf => conf.id === activeBuilding.unitMap[key]);
                                            return (
                                                <button key={key} onClick={() => handleUnitClick(flr, u)} className={`h-10 w-12 rounded border-2 flex items-center justify-center text-[10px] font-black ${c ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white text-slate-400 border-dashed border-slate-300 hover:bg-slate-50'}`}>
                                                    {flr}{u.toString().padStart(2, '0')}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const AmenitiesTab = () => (
    <div className="space-y-6 max-w-4xl">
        <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Common Project Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Club House', 'Swimming Pool', 'Gymnasium', 'Kids Play Area', 'Jogging Track', '24x7 Security', 'Power Backup', 'EV Charging'].map((amenity) => (
                    <label key={amenity} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600" />
                        <span className="text-sm font-semibold text-slate-700">{amenity}</span>
                    </label>
                ))}
            </div>
        </Card>
    </div>
);

const PricingTab = () => (
    <div className="space-y-6 max-w-4xl">
        <Card>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Global Pricing Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Default Booking Amount" placeholder="₹ or %" />
                <Select label="GST Structure" options={['Included (5%)', 'Extra (5%)', 'Not Applicable']} />
                <Input label="Maintenance Deposit" placeholder="₹ / sq.ft" />
            </div>
        </Card>
    </div>
);

// --- STEP 5: BULK OPERATIONS (EXCEL ENGINE) ---

const StepBulkUpload = () => (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Enterprise Bulk Operations</h2>
            <p className="text-slate-500 text-sm mt-1">Mass-import inventory, auto-map columns, and export platform data.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="flex flex-col h-full border-blue-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-600 rounded-xl"><FileSpreadsheet className="h-6 w-6 text-white" /></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Import Data</h3>
                        <p className="text-sm text-slate-500">Upload inventory via structured Excel</p>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <h4 className="text-sm font-bold text-slate-800">1. Download Master Templates</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {['Apartments Matrix', 'Plots Inventory', 'Villas Configuration', 'Commercial & Lease Yield'].map((t, i) => (
                            <button key={i} className="flex justify-between items-center p-3 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group text-left">
                                <span className="text-sm font-bold text-slate-700">{t}</span>
                                <Download className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 mb-2">2. Upload & Validate</h4>
                    <FileUploadZone hint="Excel or CSV formats supported" />
                </div>
            </Card>

            <Card className="flex flex-col h-full border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-900 rounded-xl"><Download className="h-6 w-6 text-white" /></div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Export Engine</h3>
                        <p className="text-sm text-slate-500">Extract system data for CRM or reporting</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {[
                        { title: 'Complete Builder Profile', sub: 'Includes operational & legal data' },
                        { title: 'Live Inventory Matrix', sub: 'All units, plots, and pricing' },
                        { title: 'Commercial Asset Yields', sub: 'Leased & investment-ready inventory' },
                        { title: 'Pricing & Payment Plans', sub: 'Financial schedules export' }
                    ].map((exp, i) => (
                        <div key={i} className="flex justify-between items-center p-4 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer">
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{exp.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{exp.sub}</p>
                            </div>
                            <Badge variant="gray">CSV / PDF</Badge>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

// --- STEP 6: REVIEW & DASHBOARD ---

const StepReview = () => (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Final Review & Summary</h2>
                <p className="text-slate-500 text-sm mt-1">System pre-flight check before submitting to SquarFT Admins.</p>
            </div>
            <Badge variant="amber">Status: Pending Submission</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Projects Configured', value: '2', icon: Building2 },
                { label: 'Total Inventory Units', value: '450', icon: LayoutGrid },
                { label: 'Property Types', value: '4', icon: Settings },
                { label: 'Verified Docs', value: '12', icon: FileText },
            ].map((stat, i) => (
                <Card key={i} className="p-5 flex items-center gap-4 border-l-4 border-l-blue-600">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <stat.icon className="h-6 w-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                    </div>
                </Card>
            ))}
        </div>

        <Card noPadding className="border-amber-200 border-2">
            <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold text-amber-900 text-lg">Pre-Flight Validation Check</h3>
            </div>
            <div className="divide-y divide-slate-100">
                {[
                    { text: 'Builder corporate identity and RERA documents uploaded', done: true },
                    { text: 'Project location coordinates mapped', done: true },
                    { text: 'Apartment inventory pricing missing for Tower B', done: false, alert: true },
                ].map((item, i) => (
                    <div key={i} className="px-6 py-4 flex items-center gap-4 bg-white">
                        {item.done ? (
                            <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></div>
                        ) : (
                            <div className="p-1 rounded-full bg-amber-100 text-amber-600"><AlertCircle className="h-4 w-4" /></div>
                        )}
                        <span className={`text-sm font-semibold flex-1 ${item.done ? 'text-slate-700' : 'text-amber-800'}`}>
                            {item.text}
                        </span>
                        {!item.done && <button className="text-xs font-bold text-blue-600 hover:underline">Fix Now</button>}
                    </div>
                ))}
            </div>
        </Card>

        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')", backgroundBlendMode: "overlay" }}>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3 relative z-10">Deploy to Platform</h3>
            <p className="text-slate-300 mb-8 max-w-lg mx-auto relative z-10 text-sm md:text-base font-medium">Submitting will lock the core architecture and notify the SquarFT Admin team for final platform publishing.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <button className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold hover:bg-white/20 transition-all w-full sm:w-auto">
                    Save as Draft
                </button>
                <button className="px-10 py-4 bg-blue-600 text-white rounded-xl font-black text-lg hover:bg-blue-500 transition-all shadow-md flex items-center justify-center gap-3 w-full sm:w-auto transform hover:-translate-y-1">
                    Submit System <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </div>
    </div>
);

// --- MAIN OS SHELL ---

export default function App() {
    const [activeStep, setActiveStep] = useState(2);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const steps = [
        { id: 1, title: 'Builder Profile', icon: Building2, desc: 'Entity & Docs' },
        { id: 2, title: 'Project Engine', icon: LayoutGrid, desc: 'Nested Architecture' },
        { id: 3, title: 'Bulk Data', icon: FileSpreadsheet, desc: 'Import / Export' },
        { id: 4, title: 'Review System', icon: ShieldCheck, desc: 'Validation & Submit' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/30">
                                <Landmark className="text-white h-5 w-5" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-white">Squar<span className="text-blue-500">FT</span></h1>
                        </div>
                        <span className="px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">PropTech OS</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    <div className="space-y-2 relative">
                        <div className="absolute left-7 top-6 bottom-6 w-px bg-slate-800 hidden lg:block -z-10" />

                        {steps.map((step) => {
                            const isActive = activeStep === step.id;
                            const isPast = activeStep > step.id;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => { setActiveStep(step.id); setIsMobileMenuOpen(false); }}
                                    className={`w-full text-left p-3 rounded-2xl transition-all duration-300 flex gap-4 group ${isActive ? 'bg-blue-600 shadow-lg shadow-blue-600/20 ring-1 ring-blue-500/50' : 'hover:bg-slate-800/50'
                                        }`}
                                >
                                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-all font-bold ${isActive ? 'bg-white text-blue-700 shadow-md' :
                                        isPast ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700 text-slate-500 group-hover:border-slate-600 group-hover:text-slate-300'
                                        }`}>
                                        {isPast ? <CheckCircle2 className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h3 className={`font-bold text-sm transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                            {step.title}
                                        </h3>
                                        <p className={`text-xs font-semibold mt-0.5 transition-colors ${isActive ? 'text-blue-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                            {step.desc}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-5 border-t border-slate-800 bg-slate-900/50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-slate-400 border border-slate-700 shadow-sm">
                        RM
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-300">Admin Session</p>
                        <p className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1 mt-0.5 tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-md"></span> Auto-Saving
                        </p>
                    </div>
                </div>
            </div>

            <div className="lg:ml-72 flex-1 flex flex-col min-h-screen min-w-0">
                <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl lg:hidden transition-colors">
                            <Menu className="h-6 w-6" />
                        </button>
                        <div className="flex items-center text-sm font-bold text-slate-500 truncate">
                            <span className="hidden sm:inline">System Setup</span>
                            <ChevronRight className="h-4 w-4 mx-2 hidden sm:block text-slate-300" />
                            <span className="text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{steps.find(s => s.id === activeStep)?.title}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <button className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors hidden sm:block px-2">
                            Save Draft
                        </button>
                        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
                        <button
                            onClick={() => setActiveStep(prev => Math.min(prev + 1, steps.length))}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/10 whitespace-nowrap active:scale-95 flex items-center gap-2"
                        >
                            {activeStep === steps.length ? 'Finalize' : 'Next Step'} <ArrowRight className="h-4 w-4 hidden sm:block" />
                        </button>
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-10 w-full mx-auto pb-32" style={{ maxWidth: '80rem' }}>
                    {activeStep === 1 && <StepBuilderProfile />}
                    {activeStep === 2 && <StepProjectEngine />}
                    {activeStep === 3 && <StepBulkUpload />}
                    {activeStep === 4 && <StepReview />}
                </main>
            </div>
        </div>
    );
}