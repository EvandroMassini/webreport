/**
 * Criado pela IA: demonstra parâmetros sem depender do gerador PHP.
 * Lê apenas os marcadores informados pela aplicação. Não executa nem transforma SQL.
 * No ecossistema original o PHP identifica esses marcadores e devolve formulários.
 */
var ExampleParameters = (function () {
    /** Coleta data, período, texto e constantes ausentes; seleção usa opções explícitas. */
    function ask(markers, { title = 'Parâmetros do relatório', defaults = {}, selections = [] } = {}) {
        const fields = [];
        const labels = { '<DATA>': 'Data', '<DATA INICIAL>': 'Data inicial', '<DATA FINAL>': 'Data final' };
        for (const marker of new Set(markers)) {
            const date = Object.hasOwn(labels, marker);
            const text = marker.match(/^<\[(.+)\]>$/);
            const constant = marker.match(/^<<(.+)>>$/);
            if (!date && !text && !constant) throw new Error('Marcador desconhecido: ' + marker);
            fields.push({ key: marker, type: date ? 'date' : 'text', label: labels[marker] || text?.[1] || constant[1] });
        }
        fields.push(...selections.map(s => ({ ...s, type: 'select' })));
        return new Promise(resolve => {
            const dialog = document.createElement('dialog');
            dialog.className = 'example-parameters';
            dialog.setAttribute('aria-labelledby', 'example-parameters-title');
            const form = document.createElement('form');
            const heading = document.createElement('h2');
            heading.id = 'example-parameters-title'; heading.textContent = title;
            form.append(heading);
            const controls = new Map();
            for (const field of fields) {
                const label = document.createElement('label'); label.textContent = field.label;
                const input = document.createElement(field.type === 'select' ? 'select' : 'input');
                input.name = field.key; input.required = true;
                if (field.type === 'select') {
                    input.multiple = Boolean(field.multiple);
                    for (const option of field.options) {
                        const node = document.createElement('option');
                        node.value = option.value; node.textContent = option.label;
                        node.selected = input.multiple && (defaults[field.key] || []).includes(option.value);
                        input.append(node);
                    }
                } else { input.type = field.type; if (field.type === 'text') input.maxLength = 240; }
                if (!input.multiple) input.value = defaults[field.key] || input.value;
                controls.set(field.key, input); label.append(input); form.append(label);
            }
            const error = document.createElement('p'); error.setAttribute('role', 'alert'); form.append(error);
            const footer = document.createElement('footer');
            const cancel = document.createElement('button'); cancel.type = 'button'; cancel.textContent = 'Cancelar';
            const submit = document.createElement('button'); submit.type = 'submit'; submit.textContent = 'Confirmar';
            footer.append(cancel, submit); form.append(footer); dialog.append(form); document.body.append(dialog);
            let settled = false;
            const finish = value => { if (settled) return; settled = true; dialog.close(); dialog.remove(); resolve(value); };
            cancel.addEventListener('click', () => finish(null));
            dialog.addEventListener('cancel', event => { event.preventDefault(); finish(null); });
            // Impede que Escape também seja processado pelo framework da página hospedeira.
            dialog.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); finish(null); } });
            form.addEventListener('submit', event => {
                event.preventDefault();
                if (!form.reportValidity()) return;
                const values = Object.fromEntries(Array.from(controls, ([key, input]) => [key, input.multiple ? Array.from(input.selectedOptions, o => o.value) : input.value.trim()]));
                if (values['<DATA INICIAL>'] > values['<DATA FINAL>']) { error.textContent = 'A data inicial deve ser anterior ou igual à data final.'; return; }
                if (Object.values(values).some(v => typeof v === 'string' && !v)) { error.textContent = 'Preencha todas as informações.'; return; }
                finish(values);
            });
            dialog.showModal();
        });
    }
    return { ask };
})();
