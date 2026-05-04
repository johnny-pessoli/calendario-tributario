(() => {
  if (window.self !== window.top) {
    document.documentElement.classList.add('embedded');
  }

  const categoryButtons = document.querySelectorAll('.leg[data-filter-category]');
  const regimeButtons = document.querySelectorAll('.leg[data-filter-regime]');
  const rows = document.querySelectorAll('tbody tr[data-category]');
  const annualSection = document.querySelector('.anuais-wrap[data-category="anual"]');
  const tableWrap = document.querySelector('.wrap');
  const emptyMessage = document.querySelector('.filter-empty');
  const taxSearch = document.querySelector('#tax-search');
  const clearSearch = document.querySelector('.clear-search');
  const searchCount = document.querySelector('.search-count');
  const officialUpdates = document.querySelector('.official-updates');

  let selectedCategory = 'todos';
  let selectedRegime = 'todos';
  let searchTerm = '';

  const normalizeText = (value) => value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const safeUrl = (value) => {
    try {
      const url = new URL(value);
      const hostname = url.hostname.toLowerCase();
      const isOfficialHost = hostname === 'gov.br'
        || hostname.endsWith('.gov.br')
        || hostname === 'fazenda.gov.br'
        || hostname.endsWith('.fazenda.gov.br');
      if (url.protocol !== 'https:' || !isOfficialHost) return null;
      return url.href;
    } catch {
      return null;
    }
  };

  const appendText = (parent, text) => {
    parent.appendChild(document.createTextNode(text));
  };

  const matchesRegime = (item) => {
    const regimes = (item.dataset.regimes || 'todos').split(' ');
    return selectedRegime === 'todos' || regimes.includes(selectedRegime);
  };

  const matchesSearch = (item) => {
    if (!searchTerm) return true;
    return normalizeText(item.textContent).includes(searchTerm);
  };

  const setActiveButton = (buttons, activeButton) => {
    buttons.forEach((button) => {
      const isActive = button === activeButton;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  };

  const updateDayMarkers = (container) => {
    let activeDay = null;
    let activeDayHasVisibleItem = false;

    const updateActiveDay = () => {
      if (activeDay) {
        activeDay.classList.toggle('is-hidden', !activeDayHasVisibleItem);
      }
    };

    Array.from(container.children).forEach((child) => {
      if (child.classList.contains('day')) {
        updateActiveDay();
        activeDay = child;
        activeDayHasVisibleItem = false;
        return;
      }

      if (child.classList.contains('tag') && !child.classList.contains('is-hidden')) {
        activeDayHasVisibleItem = true;
      }
    });

    updateActiveDay();
    return Boolean(container.querySelector('.tag:not(.is-hidden)'));
  };

  const applyFilters = () => {
    let visibleRows = 0;
    let visibleItems = 0;

    rows.forEach((row) => {
      const categoryMatches = selectedCategory === 'todos' || row.dataset.category === selectedCategory;
      let rowHasVisibleItems = false;

      row.querySelectorAll('.tag').forEach((tag) => {
        const isVisible = categoryMatches && matchesRegime(tag) && matchesSearch(tag);
        tag.classList.toggle('is-hidden', !isVisible);
        if (isVisible) {
          rowHasVisibleItems = true;
          visibleItems += 1;
        }
      });

      row.querySelectorAll('td:not(.row-head)').forEach((cell) => {
        updateDayMarkers(cell);
      });

      const shouldShowRow = categoryMatches && rowHasVisibleItems;
      row.classList.toggle('is-hidden', !shouldShowRow);
      if (shouldShowRow) visibleRows += 1;
    });

    const annualCategoryMatches = selectedCategory === 'todos' || selectedCategory === 'anual';
    let annualHasVisibleItems = false;

    annualSection.querySelectorAll('.tag-inline').forEach((tag) => {
      const isVisible = annualCategoryMatches && matchesRegime(tag) && matchesSearch(tag);
      tag.classList.toggle('is-hidden', !isVisible);
      if (isVisible) {
        annualHasVisibleItems = true;
        visibleItems += 1;
      }
    });

    const showAnnual = annualCategoryMatches && annualHasVisibleItems;

    tableWrap.classList.toggle('is-hidden', visibleRows === 0);
    annualSection.classList.toggle('is-hidden', !showAnnual);
    emptyMessage.classList.toggle('is-visible', visibleRows === 0 && !showAnnual);

    if (searchTerm) {
      searchCount.textContent = visibleItems === 1
        ? '1 prazo encontrado para a pesquisa.'
        : `${visibleItems} prazos encontrados para a pesquisa.`;
    } else {
      searchCount.textContent = 'Mostrando todos os prazos compatíveis com os filtros.';
    }
  };

  const renderOfficialUpdates = () => {
    const updates = window.GOVERNMENT_UPDATES;
    if (!updates || !updates.hasChanges || !Array.isArray(updates.changes) || updates.changes.length === 0) return;

    const checkedAt = updates.checkedAt
      ? new Date(updates.checkedAt).toLocaleString('pt-BR')
      : 'data nao informada';

    officialUpdates.textContent = '';

    const title = document.createElement('strong');
    title.textContent = 'Atualizacao oficial detectada';
    officialUpdates.appendChild(title);

    appendText(officialUpdates, `${updates.message || 'Revise as fontes oficiais antes de atualizar prazos.'} Verificacao realizada em ${checkedAt}.`);

    const list = document.createElement('ul');

    updates.changes.slice(0, 5).forEach((change) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      const url = safeUrl(change.url);

      link.textContent = change.name || 'Fonte oficial';
      if (url) {
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }

      const affects = Array.isArray(change.affects) && change.affects.length
        ? change.affects.join(', ')
        : 'prazos tributarios';
      const sourceMeta = document.createElement('span');
      sourceMeta.className = 'meta';
      sourceMeta.textContent = `Fonte: ${change.authority || 'nao informada'} | Afeta: ${affects}`;

      const updateMeta = document.createElement('span');
      updateMeta.className = 'meta';
      updateMeta.textContent = `Tipo: ${change.changeType || 'alteracao'} | Atualizado na fonte: ${change.updatedAt || 'nao informado'}`;

      item.appendChild(link);
      item.appendChild(sourceMeta);
      item.appendChild(updateMeta);
      list.appendChild(item);
    });

    officialUpdates.appendChild(list);
    officialUpdates.classList.add('is-visible');
  };

  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.filterCategory;
      setActiveButton(categoryButtons, button);
      applyFilters();
    });
  });

  regimeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedRegime = button.dataset.filterRegime;
      setActiveButton(regimeButtons, button);
      applyFilters();
    });
  });

  taxSearch.addEventListener('input', () => {
    searchTerm = normalizeText(taxSearch.value.trim());
    applyFilters();
  });

  clearSearch.addEventListener('click', () => {
    taxSearch.value = '';
    searchTerm = '';
    taxSearch.focus();
    applyFilters();
  });

  applyFilters();
  renderOfficialUpdates();
})();
