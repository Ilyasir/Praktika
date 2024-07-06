let currentPage = 1;
const pageSize = 10;
let totalPages = 1;

async function fetchAndParseVacancies() {
    const specialization = document.getElementById('specialization').value;
    showLoader(true);
    const response = await fetch(`/fetch_vacancies?specialization=${specialization}`, {
        method: 'POST'
    });
    const data = await response.json();
    alert(data.status);
    showLoader(false);
    fetchVacancies();
}

async function fetchVacancies() {
    const search = document.getElementById('search').value;
    const currency = document.getElementById('currency').value;
    const minSalary = document.getElementById('min_salary').value;
    const maxSalary = document.getElementById('max_salary').value;
    const sortBySalary = document.getElementById('sort_by_salary').value;
    const specialization = document.getElementById('specialization').value;

    let query = `/vacancies?specialization=${specialization}&search_name=${search}&currency=${currency}&min_salary=${minSalary}&max_salary=${maxSalary}&sort_by_salary=${sortBySalary}&page=${currentPage}&page_size=${pageSize}`;

    showLoader(true);
    const response = await fetch(query);
    const data = await response.json();
    showLoader(false);

    const vacanciesDiv = document.getElementById('vacancies');
    vacanciesDiv.innerHTML = '';

    data.vacancies.forEach(vacancy => {
        const div = document.createElement('div');
        div.className = 'vacancy';
        div.innerHTML = `
            <h2>${vacancy.name}</h2>
            <p>Работодатель: ${vacancy.employer_name}</p>
            <p>Зарплата: ${vacancy.salary_from} - ${vacancy.salary_to} ${vacancy.currency}</p>
            <p>Опубликовано: ${new Date(vacancy.published_at).toLocaleDateString()}</p>
        `;
        vacanciesDiv.appendChild(div);
    });

    totalPages = Math.ceil(data.total / data.page_size);
    document.getElementById('page-info').textContent = `Страница ${data.page} из ${totalPages} (всего вакансий: ${data.total})`;
    renderPageNumbers();
}

function renderPageNumbers() {
    const pageNumbersDivTop = document.getElementById('page-numbers-top');
    const pageNumbersDivBottom = document.getElementById('page-numbers-bottom');
    pageNumbersDivTop.innerHTML = '';
    pageNumbersDivBottom.innerHTML = '';
    
    const maxPagesToShow = 5;
    const startPage = Math.max(currentPage - Math.floor(maxPagesToShow / 2), 1);
    const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    if (startPage > 1) {
        const firstPageButton = createPageButton(1);
        pageNumbersDivTop.appendChild(firstPageButton);
        pageNumbersDivBottom.appendChild(firstPageButton.cloneNode(true));
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            pageNumbersDivTop.appendChild(dots);
            pageNumbersDivBottom.appendChild(dots.cloneNode(true));
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = createPageButton(i);
        pageNumbersDivTop.appendChild(button);
        pageNumbersDivBottom.appendChild(button.cloneNode(true));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            pageNumbersDivTop.appendChild(dots);
            pageNumbersDivBottom.appendChild(dots.cloneNode(true));
        }
        const lastPageButton = createPageButton(totalPages);
        pageNumbersDivTop.appendChild(lastPageButton);
        pageNumbersDivBottom.appendChild(lastPageButton.cloneNode(true));
    }
}

function createPageButton(page) {
    const button = document.createElement('button');
    button.className = 'btn btn-secondary';
    button.textContent = page;
    button.onclick = () => goToPage(page);
    if (page === currentPage) {
        button.style.fontWeight = 'bold';
        button.classList.add('active');
    }
    return button;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchVacancies();
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        fetchVacancies();
    }
}

function goToPage(page) {
    currentPage = page;
    fetchVacancies();
}

async function fetchSpecializations() {
    const query = document.getElementById('specialization').value;
    if (query.length < 2) {
        document.getElementById('specialization-list').innerHTML = '';
        return;
    }

    const response = await fetch(`/specializations?query=${query}`);
    const data = await response.json();

    const specializationList = document.getElementById('specialization-list');
    specializationList.innerHTML = '';

    data.forEach(spec => {
        const div = document.createElement('div');
        div.textContent = spec;
        div.onclick = () => selectSpecialization(spec);
        specializationList.appendChild(div);
    });
}

function selectSpecialization(specialization) {
    document.getElementById('specialization').value = specialization;
    document.getElementById('specialization-list').innerHTML = '';
}

async function clearDatabase() {
    if (!confirm('Вы уверены, что хотите очистить базу данных?')) {
        return;
    }

    showLoader(true);
    const response = await fetch('/clear_database', {
        method: 'POST'
    });
    const data = await response.json();
    showLoader(false);

    if (data.status === 'Database cleared successfully') {
        alert('База данных успешно очищена.');
    } else {
        alert('Ошибка при очистке базы данных.');
    }
}

function showLoader(isLoading) {
    const loader = document.getElementById('loader');
    loader.style.display = isLoading ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('min_salary').value = 0;
    document.getElementById('max_salary').value = 10000000;
    document.getElementById('min_salary').step = 1000;
    document.getElementById('max_salary').step = 1000;
    fetchVacancies();
});
