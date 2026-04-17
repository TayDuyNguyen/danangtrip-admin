const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'public/lang');

const updateJson = (lang, ns, updates) => {
    const file = path.join(localesDir, lang, `${ns}.json`);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    
    // recursive merge
    const merge = (target, source) => {
        for (const key in source) {
            if (source[key] instanceof Object && !Array.isArray(source[key])) {
                target[key] = merge(target[key] || {}, source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    };

    merge(data, updates);
    fs.writeFileSync(file, JSON.stringify(data, null, 4)); // Admin project uses 4 spaces typically or let's use 4
    console.log(`Updated ${file}`);
};

// ------ VIETNAMESE ------

// common.vi
updateJson('vi', 'common', {
    currency: "đ",
    seo: {
        description_admin: "Hệ thống quản trị Đà Nẵng Trip Admin",
        description_platform: "Nền tảng quản lý tour du lịch và doanh thu chuyên nghiệp. Tối ưu hóa vận hành doanh nghiệp lữ hành tại Đà Nẵng."
    }
});

// dashboard.vi
updateJson('vi', 'dashboard', {
    welcome_back: "Chào mừng trở lại,"
});

// tour.vi
updateJson('vi', 'tour', {
    filters: {
        active_filtering: "Đang áp dụng:"
    },
    form: {
        daily_tour: "Tour hằng ngày",
        island_tour: "Tour biển đảo",
        culture_tour: "Tour văn hóa"
    }
});

// ------ ENGLISH ------

// common.en
updateJson('en', 'common', {
    currency: "VND",
    seo: {
        description_admin: "DaNang Trip Admin Dashboard",
        description_platform: "Professional tour and revenue management platform. Optimizing tour operations in Da Nang."
    }
});

// dashboard.en
updateJson('en', 'dashboard', {
    welcome_back: "Welcome back,"
});

// tour.en
updateJson('en', 'tour', {
    filters: {
        active_filtering: "Active filters:"
    },
    form: {
        daily_tour: "Daily Tour",
        island_tour: "Island & Beach Tour",
        culture_tour: "Culture Tour"
    }
});
