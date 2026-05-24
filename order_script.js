/**
 * ENTOMASTER – order_script.js v4 (hawasite)
 * Script universel pour les 7 pages d'ordre.
 * Gère tous les formats de données :
 *  - coleopteres  : speciesData = {family:[{scientificName,...}]}
 *  - hemipteres   : speciesData = {family:[{scientificName,...}]}
 *  - lepidopteres : speciesData = {'key':{name,hote,envergure,...}}
 *  - dipteres     : speciesData = {'Name':{family,size,...}}
 *  - hymenopteres : speciesData = {'key':{name,taille,hote,details:[]}}
 *  - thysanopteres: JSON fetch
 *  - orthopteres  : GLOBAL_SEARCH_INDEX filtré
 */
'use strict';

const CURRENT_DIR = (function(){
    const p=window.location.pathname;
    const dirs=['coleopteres','lepidopteres','dipteres','hemipteres','thysanopteres','hymenopteres','orthopteres'];
    for(const d of dirs) if(p.includes('/'+d+'/')) return d;
    return '';
})();

const ORDER_LABELS={coleopteres:'Coléoptères',lepidopteres:'Lépidoptères',dipteres:'Diptères',
    hemipteres:'Hémiptères',thysanopteres:'Thysanoptères',hymenopteres:'Hyménoptères',orthopteres:'Orthoptères'};
const CURRENT_ORDER_FR=ORDER_LABELS[CURRENT_DIR]||'';
let allCards=[];

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function prefixImg(img,dir){
    if(!img) return '';
    if(img.startsWith('http')||img.startsWith('../')||img.includes('/')) return img;
    return dir+'/'+img;
}

function detectFamily(name){
    const n=name.toLowerCase();
    if(['cossus','zeuzera'].some(k=>n.includes(k))) return 'Cossidae';
    if(['prays','yponomeuta'].some(k=>n.includes(k))) return 'Yponomeutidae';
    if(['lobesia','cydia'].some(k=>n.includes(k))) return 'Tortricidae';
    if(['agrotis','spodoptera','helicoverpa','tuta'].some(k=>n.includes(k))) return 'Noctuidae';
    if(['ceratitis','bactrocera','drosophila','zaprionus'].some(k=>n.includes(k))) return 'Tephritidae';
    if(['liriomyza'].some(k=>n.includes(k))) return 'Agromyzidae';
    if(['mayetiola','dasineura','contarinia'].some(k=>n.includes(k))) return 'Cecidomyiidae';
    if(['cephus'].some(k=>n.includes(k))) return 'Cephidae';
    if(['hoplocampa'].some(k=>n.includes(k))) return 'Tenthredinidae';
    if(['tapinoma','lasius','formica'].some(k=>n.includes(k))) return 'Formicidae';
    return 'Famille non définie';
}

/* ── Normalisation ── */
function normalizeSpecies(){
    const sd=window.speciesData;
    const result=[];

    if(!sd){
        if(CURRENT_DIR==='thysanopteres') return normalizeThysanopteres();
        return normalizeFromIndex();
    }

    if(CURRENT_DIR==='coleopteres'||CURRENT_DIR==='hemipteres'){
        Object.entries(sd).forEach(([fam,spp])=>{
            if(!Array.isArray(spp)) return;
            spp.forEach(sp=>{
                result.push({
                    name:sp.scientificName||sp.name||'',common:sp.commonName||sp.common||'',
                    family:sp.family||fam,host:sp.host||'',author:sp.author||'',
                    size:sp.size||'',color:sp.color||'',
                    image:prefixImg(sp.image||'',CURRENT_DIR),
                    description:sp.description||'',
                    characteristics:sp.characteristics||[],
                    suborder:sp.suborder||'',
                    order:CURRENT_ORDER_FR,url:CURRENT_DIR+'/index.html'
                });
            });
        });
        return result;
    }

    if(CURRENT_DIR==='lepidopteres'){
        Object.entries(sd).forEach(([key,sp])=>{
            if(!sp||!sp.name) return;
            result.push({
                name:sp.name,common:sp.common||'',family:sp.family||detectFamily(sp.name),
                host:sp.hote||sp.host||'',author:sp.author||'',
                size:sp.envergure||sp.size||'',color:sp.couleur||sp.color||'',
                image:prefixImg(sp.image||'',CURRENT_DIR),
                description:sp.description||'',characteristics:sp.characteristics||sp.details||[],
                order:CURRENT_ORDER_FR,url:CURRENT_DIR+'/index.html'
            });
        });
        return result;
    }

    if(CURRENT_DIR==='dipteres'){
        Object.entries(sd).forEach(([name,sp])=>{
            if(!name) return;
            result.push({
                name,common:sp.common||'',family:sp.family||detectFamily(name),
                host:sp.habitat||sp.host||'',author:sp.scientificName||sp.author||'',
                size:sp.size||'',color:sp.color||'',
                image:prefixImg(sp.image||'',CURRENT_DIR),
                description:sp.description||'',characteristics:[],
                order:CURRENT_ORDER_FR,url:CURRENT_DIR+'/index.html'
            });
        });
        return result;
    }

    if(CURRENT_DIR==='hymenopteres'){
        Object.entries(sd).forEach(([key,sp])=>{
            if(!sp||!sp.name) return;
            result.push({
                name:sp.name,common:'',family:sp.family||detectFamily(sp.name),
                host:sp.hote||sp.host||'',author:sp.author||'',
                size:sp.taille||sp.size||'',color:sp.couleur||sp.color||'',
                image:prefixImg(sp.image||'',CURRENT_DIR),
                description:sp.description||'',
                characteristics:sp.details||sp.characteristics||[],
                order:CURRENT_ORDER_FR,url:CURRENT_DIR+'/index.html'
            });
        });
        return result;
    }

    return normalizeFromIndex();
}

function normalizeThysanopteres(){
    const data=window.thysanopteresData;
    if(!data) return [];
    const result=[];
    Object.values(data).forEach(sub=>{
        Object.entries(sub).forEach(([fam,spp])=>{
            spp.forEach(sp=>result.push({
                name:sp.name||'',common:sp.common_name||'',family:fam,
                host:sp.habitat||'',author:'',size:sp.size||'',color:sp.color||'',
                image:sp.image?prefixImg(sp.image,CURRENT_DIR):'',
                description:'',characteristics:sp.characteristics||[],
                order:CURRENT_ORDER_FR,url:CURRENT_DIR+'/index.html'
            }));
        });
    });
    return result;
}

function normalizeFromIndex(){
    return (window.GLOBAL_SEARCH_INDEX||[])
        .filter(sp=>(sp.order||'').toLowerCase()===CURRENT_ORDER_FR.toLowerCase())
        .map(sp=>({...sp,characteristics:[]}));
}

/* ── Rendu ── */
function renderOrder(species){
    const container=document.getElementById('species-container');
    if(!container) return;
    if(!species.length){
        container.innerHTML='<p style="text-align:center;color:var(--text-m);padding:3rem">Aucune espèce disponible.</p>';
        return;
    }
    const groups={};
    species.forEach(sp=>{
        const fam=sp.family||'Famille non définie';
        if(!groups[fam]) groups[fam]=[];
        groups[fam].push(sp);
    });
    const frag=document.createDocumentFragment();
    allCards=[];
    Object.entries(groups).forEach(([family,spp])=>{
        const section=document.createElement('section');
        section.className='family-section';
        section.dataset.family=family.toLowerCase();
        const hdr=document.createElement('div');
        hdr.className='family-hdr';
        hdr.innerHTML=`<h2>Famille : <em>${esc(family)}</em></h2><span class="family-count">${spp.length} espèce${spp.length>1?'s':''}</span>`;
        section.appendChild(hdr);
        const grid=document.createElement('div');
        grid.className='sp-grid';
        grid.setAttribute('role','list');
        spp.forEach(sp=>{
            const card=makeCard(sp,family);
            grid.appendChild(card);
            allCards.push({el:card,sp,family});
        });
        section.appendChild(grid);
        frag.appendChild(section);
    });
    container.appendChild(frag);
    updateCount();
}

function makeCard(sp,family){
    const {openModal,showTooltip,posTooltipAt,hideTooltip}=window.ENT||{};
    const icon=(window.ENT?.ORDER_ICONS||{})[sp.order]||'🐛';
    const name=sp.name||'';
    const card=document.createElement('article');
    card.className='sp-card';
    card.setAttribute('role','listitem');
    card.setAttribute('tabindex','0');
    card.setAttribute('aria-label',`${name} – cliquer pour la fiche`);
    card.dataset.name=name.toLowerCase();
    card.dataset.common=(sp.common||'').toLowerCase();
    card.dataset.host=(sp.host||'').toLowerCase();
    card.dataset.family=family.toLowerCase();

    let imgSrc=sp.image||'';
    if(!imgSrc){
        const slug=name.toLowerCase().replace(/\s+/g,'_').replace(/[éèê]/g,'e').replace(/[àâ]/g,'a')+'.jpg';
        imgSrc=CURRENT_DIR+'/'+slug;
    }

    card.innerHTML=`
        <div class="sp-img">
            <img src="${esc(imgSrc)}" alt="${esc(name)}" loading="lazy"
                onerror="this.parentElement.innerHTML='<span style=\\"font-size:2.5rem;display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-d)\\">${icon}</span>'">
            <span class="sp-img-badge">${esc(family)}</span>
        </div>
        <div class="sp-body">
            <p class="sp-name">${esc(name)}</p>
            ${sp.author?`<p class="sp-author">${esc(sp.author)}</p>`:''}
            ${sp.common&&sp.common!==name?`<p class="sp-common">${esc(sp.common)}</p>`:''}
            <p class="sp-family">${esc(family)}</p>
            ${sp.host?`<p class="sp-host">🌿 ${esc(sp.host)}</p>`:''}
            ${sp.size?`<p class="sp-size">📏 ${esc(sp.size)}</p>`:''}
        </div>
        <span class="sp-more">Voir la fiche →</span>`;

    card.addEventListener('mouseenter',ev=>showTooltip&&showTooltip(ev,sp,{family}));
    card.addEventListener('mousemove',ev=>posTooltipAt&&posTooltipAt(ev.clientX,ev.clientY));
    card.addEventListener('mouseleave',()=>window.ENT?.hideTooltip&&window.ENT.hideTooltip());
    card.addEventListener('focus',ev=>showTooltip&&showTooltip(ev,sp,{family}));
    card.addEventListener('blur',()=>window.ENT?.hideTooltip&&window.ENT.hideTooltip());
    const go=()=>openModal&&openModal({name:sp.name,common:sp.common,author:sp.author,
        family:sp.family||family,order:sp.order||CURRENT_ORDER_FR,
        host:sp.host,size:sp.size,color:sp.color,description:sp.description,
        image:imgSrc,characteristics:sp.characteristics||[]});
    card.addEventListener('click',go);
    card.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();go();}});
    return card;
}

/* ── Filtre ── */
function initFilter(){
    const search=document.getElementById('spSearch'),famSel=document.getElementById('famFilter'),
          noRes=document.getElementById('noResults'),resetBtn=document.getElementById('resetBtn');
    let timer;
    const apply=()=>{
        clearTimeout(timer);
        timer=setTimeout(()=>{
            const q=(search?.value||'').toLowerCase().trim();
            const f=(famSel?.value||'').toLowerCase();
            let vis=0;const secVis={};
            allCards.forEach(({el,family})=>{
                const m=(!q||el.dataset.name.includes(q)||el.dataset.common.includes(q)||el.dataset.host.includes(q))&&(!f||el.dataset.family.includes(f));
                el.style.display=m?'':'none';
                if(m){vis++;secVis[family.toLowerCase()]=true;}
            });
            document.querySelectorAll('.family-section').forEach(sec=>{sec.style.display=secVis[sec.dataset.family]?'':'none';});
            noRes?.classList.toggle('show',vis===0);
            updateCount(vis);
        },120);
    };
    search?.addEventListener('input',apply);
    famSel?.addEventListener('change',apply);
    resetBtn?.addEventListener('click',()=>{if(search)search.value='';if(famSel)famSel.value='';apply();});
}

function updateCount(v){
    const el=document.getElementById('filterCount');if(!el)return;
    const t=allCards.length,s=v!==undefined?v:t;
    el.textContent=s===t?`${t} espèce${t>1?'s':''}`:`${s} / ${t} espèces`;
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded',()=>{
    const run=()=>{renderOrder(normalizeSpecies());initFilter();};

    if(CURRENT_DIR==='thysanopteres'){
        fetch('../thysanopteres/thysanopteres_data.json').then(r=>r.json())
            .then(data=>{window.thysanopteresData=data;})
            .catch(()=>{})
            .finally(()=>{
                const w=setInterval(()=>{if(window.ENT&&window.GLOBAL_SEARCH_INDEX){clearInterval(w);run();}},40);
                setTimeout(()=>{clearInterval(w);if(!allCards.length)run();},4000);
            });
        return;
    }

    const wait=setInterval(()=>{
        if(window.ENT&&window.GLOBAL_SEARCH_INDEX){clearInterval(wait);run();}
    },40);
    setTimeout(()=>{clearInterval(wait);if(!allCards.length)run();},4000);
});
