#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
泉州eDNA宏条形码分析完整Pipeline
=====================================
基于模拟的泉州海湾/河流eDNA采样数据，演示从FASTQ到生态报告的完整分析流程。

技术栈: Python + Biopython + scikit-learn + pandas + matplotlib + seaborn
功能对标: QIIME2 (DADA2 + taxonomy + diversity + visualization)

作者: 泉州生态智源科技有限公司 (模拟)
日期: 2025
"""

import os
import json
import math
import random
import numpy as np
import pandas as pd
from collections import defaultdict, Counter
from scipy.spatial.distance import pdist, squareform
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns

# ==================== 配置参数 ====================
RANDOM_SEED = 42
DATA_DIR = "./qz_edna_data"        # 输入数据目录
OUTPUT_DIR = "./qz_edna_output"    # 输出结果目录

# ==================== PART 1: 数据生成 ====================
def generate_simulated_edna_data(data_dir, seed=RANDOM_SEED):
    """
    生成模拟的泉州eDNA数据集
    
    模拟场景: 4个站点 × 3个重复 = 12个样本
    - QZ_A: 泉州湾河口 (污染/入侵)
    - QZ_B: 围头湾 (健康/保护)
    - QZ_C: 大港湾 (养殖区)
    - QZ_R: 晋江中游 (淡水)
    """
    os.makedirs(data_dir, exist_ok=True)
    random.seed(seed)
    np.random.seed(seed)
    
    # 物种参考库 (模拟12S rRNA V5区宏条形码序列)
    species_db = {
        "Pagrus_major": {"name": "真鲷", "group": "鱼类",
            "seq": "ATGACCGTAGCTAATCGGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC"},
        "Acanthopagrus_schlegelii": {"name": "黑鲷", "group": "鱼类",
            "seq": "ATGACCGTAGCTAATCGGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGT"},
        "Lateolabrax_japonicus": {"name": "花鲈", "group": "鱼类",
            "seq": "ATGACCGTAGCTAATCGGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGA"},
        "Periophthalmus_modestus": {"name": "弹涂鱼", "group": "鱼类",
            "seq": "ATGACCGTAGCTAATCGGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC"},
        "Spartina_alterniflora": {"name": "互花米草", "group": "入侵植物",
            "seq": "CGTACGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC"},
        "Acipenser_sinensis": {"name": "中华鲟", "group": "珍稀鱼类",
            "seq": "GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC"},
        "Calanus_sinicus": {"name": "中华哲水蚤", "group": "浮游动物",
            "seq": "TACGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCT"},
        "Sagitta": {"name": "箭虫", "group": "浮游动物",
            "seq": "TACGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCA"},
        "Sinonovacula_constricta": {"name": "缢蛏", "group": "底栖生物",
            "seq": "GTACGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGC"},
        "Mactra_antiquata": {"name": "西施舌", "group": "底栖生物",
            "seq": "GTACGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGT"},
        "Alphaproteobacteria_sp": {"name": "α-变形菌", "group": "细菌",
            "seq": "CGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG"},
        "Gammaproteobacteria_sp": {"name": "γ-变形菌", "group": "细菌",
            "seq": "CGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAC"},
        "Actinobacteria_sp": {"name": "放线菌", "group": "细菌",
            "seq": "CGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAT"},
    }
    
    bases = ['A', 'T', 'G', 'C']
    
    def mutate_seq(seq, error_rate=0.015):
        seq_list = list(seq)
        for i in range(len(seq_list)):
            if random.random() < error_rate:
                seq_list[i] = random.choice([b for b in bases if b != seq_list[i]])
        return ''.join(seq_list)
    
    # 采样方案: 各站点物种丰度配置
    sampling_plan = {
        "QZ_A": {  # 泉州湾河口 — 污染/入侵严重
            "Pagrus_major": 15, "Acanthopagrus_schlegelii": 10,
            "Spartina_alterniflora": 80,  # 入侵物种高丰度!
            "Calanus_sinicus": 20,
            "Alphaproteobacteria_sp": 100, "Gammaproteobacteria_sp": 80, "Actinobacteria_sp": 40,
        },
        "QZ_B": {  # 围头湾 — 健康/保护良好
            "Pagrus_major": 40, "Acanthopagrus_schlegelii": 35, "Lateolabrax_japonicus": 25,
            "Periophthalmus_modestus": 20, "Acipenser_sinensis": 3,  # 珍稀物种偶见
            "Calanus_sinicus": 30, "Sagitta": 15,
            "Sinonovacula_constricta": 25, "Mactra_antiquata": 20,
            "Alphaproteobacteria_sp": 60, "Gammaproteobacteria_sp": 50, "Actinobacteria_sp": 30,
            "Spartina_alterniflora": 5,
        },
        "QZ_C": {  # 大港湾 — 养殖区
            "Pagrus_major": 20, "Acanthopagrus_schlegelii": 15, "Lateolabrax_japonicus": 10,
            "Sinonovacula_constricta": 60, "Mactra_antiquata": 40,  # 养殖贝类
            "Calanus_sinicus": 25,
            "Alphaproteobacteria_sp": 120, "Gammaproteobacteria_sp": 100, "Actinobacteria_sp": 50,
            "Spartina_alterniflora": 10,
        },
        "QZ_R": {  # 晋江中游 — 淡水
            "Pagrus_major": 5, "Acanthopagrus_schlegelii": 5,
            "Periophthalmus_modestus": 35,
            "Calanus_sinicus": 10, "Sinonovacula_constricta": 30, "Mactra_antiquata": 15,
            "Alphaproteobacteria_sp": 70, "Gammaproteobacteria_sp": 60, "Actinobacteria_sp": 80,
            "Spartina_alterniflora": 2,
        },
    }
    
    all_samples = []
    for site, species_counts in sampling_plan.items():
        for rep in range(1, 4):
            sample_id = f"{site}_{rep}"
            all_samples.append(sample_id)
            
            reads = []
            for sp, count in species_counts.items():
                base_seq = species_db[sp]["seq"]
                for _ in range(count):
                    reads.append((sp, mutate_seq(base_seq, error_rate=0.015)))
            
            # 5% chimera (模拟PCR嵌合体)
            n_chim = max(1, len(reads) // 20)
            for _ in range(n_chim):
                sps = list(species_counts.keys())
                sp1, sp2 = random.sample(sps, 2)
                half = len(species_db[sp1]["seq"]) // 2
                chim = mutate_seq(species_db[sp1]["seq"][:half] + species_db[sp2]["seq"][half:], 0.02)
                reads.append(("CHIMERA", chim))
            
            random.shuffle(reads)
            
            # 写入FASTQ
            fq_path = os.path.join(data_dir, f"{sample_id}.fastq")
            with open(fq_path, 'w') as f:
                for i, (sp, seq) in enumerate(reads):
                    q = ''.join([chr(np.random.randint(33, 74)) for _ in seq])
                    f.write(f"@{sample_id}_read{i}\n{seq}\n+\n{q}\n")
    
    # 保存参考库和元数据
    with open(os.path.join(data_dir, "species_reference.json"), 'w', encoding='utf-8') as f:
        json.dump(species_db, f, ensure_ascii=False, indent=2)
    
    site_info = {
        "QZ_A": ("泉州湾河口", "河口区", "受污染", "互花米草入侵"),
        "QZ_B": ("围头湾", "海湾", "保护良好", "红树林健康"),
        "QZ_C": ("大港湾", "海湾", "养殖区", "经济贝类养殖"),
        "QZ_R": ("晋江中游", "河流", "淡水", "城市河流"),
    }
    meta_data = []
    for site in sampling_plan.keys():
        desc = site_info[site]
        for rep in range(1, 4):
            meta_data.append({
                "sample_id": f"{site}_{rep}", "site_name": desc[0], "site_type": desc[1],
                "water_quality": desc[2], "ecological_notes": desc[3], "replicate": rep,
            })
    pd.DataFrame(meta_data).to_csv(os.path.join(data_dir, "sample_metadata.csv"), index=False, encoding='utf-8-sig')
    
    return all_samples, species_db


# ==================== PART 2: 分析Pipeline ====================

def seq_similarity(s1, s2):
    """计算两序列相似度 (Levenshtein-like simple version)"""
    if len(s1) != len(s2):
        return 0
    return sum(a == b for a, b in zip(s1, s2)) / len(s1)


def run_qc_and_denoise(data_dir, all_samples, species_db):
    """
    Step 2.1: FASTQ质控与序列去噪 (DADA2-like)
    
    流程:
    1. 读取FASTQ -> 序列
    2. 质量过滤: 去除含N碱基、长度<50bp的序列
    3. Chimera去除: 与参考库比对，相似度<90%视为嵌合体
    4. 去噪聚类: 97%相似度聚类，保留丰度最高的代表序列 (ASV)
    """
    print("\n🔬 Step 2.1: FASTQ质控与序列去噪 (DADA2-like)")
    
    sample_feature_tables = {}
    sample_raw_stats = {}
    ref_seqs = {v['seq'] for v in species_db.values()}
    
    for sample_id in all_samples:
        fq_path = os.path.join(data_dir, f"{sample_id}.fastq")
        
        # 读取FASTQ
        reads = []
        with open(fq_path) as f:
            lines = f.readlines()
        for i in range(0, len(lines), 4):
            if i + 1 < len(lines):
                reads.append(lines[i + 1].strip())
        
        raw_count = len(reads)
        
        # 质量过滤
        filtered = [s for s in reads if 'N' not in s and len(s) >= 50]
        
        # Chimera去除 (简化版: 与参考库比对)
        clean_seqs = []
        chimera_count = 0
        for seq in filtered:
            best_sim = max(seq_similarity(seq, ref) for ref in ref_seqs)
            if best_sim >= 0.90:
                clean_seqs.append(seq)
            else:
                chimera_count += 1
        
        # 去噪: 精确匹配去重 + 97%聚类 (模拟DADA2 ASV)
        seq_counts = Counter(clean_seqs)
        denoised = {}
        processed = set()
        
        for seq, count in seq_counts.most_common():
            if seq in processed:
                continue
            # 找到所有与当前序列相似度>97%的序列
            cluster = {seq: count}
            for other_seq, other_count in seq_counts.items():
                if other_seq != seq and other_seq not in processed:
                    if seq_similarity(seq, other_seq) >= 0.97:
                        cluster[other_seq] = other_count
            # 保留丰度最高的作为代表序列(ASV)
            rep_seq = max(cluster, key=lambda x: seq_counts[x])
            denoised[rep_seq] = sum(cluster.values())
            processed.update(cluster.keys())
        
        sample_feature_tables[sample_id] = denoised
        sample_raw_stats[sample_id] = {
            "raw_reads": raw_count, "after_qc": len(filtered),
            "after_denoise": len(clean_seqs), "chimera_removed": chimera_count,
            "n_asvs": len(denoised),
        }
        print(f"   {sample_id}: raw={raw_count} → QC={len(filtered)} → denoise={len(clean_seqs)} → ASVs={len(denoised)}")
    
    return sample_feature_tables, sample_raw_stats


def run_taxonomy_annotation(sample_feature_tables, species_db):
    """
    Step 2.2: 物种注释 (BLAST-like)
    
    将每个ASV代表序列与物种参考库比对，找到最佳匹配
    只保留相似度 >= 97% 的高置信度注释
    """
    print("\n🔍 Step 2.2: 物种注释")
    
    asv_to_species = {}
    for sample_id, asv_counts in sample_feature_tables.items():
        for asv_seq in asv_counts:
            if asv_seq not in asv_to_species:
                best_match, best_sim = None, 0
                for sp_id, sp_info in species_db.items():
                    sim = seq_similarity(asv_seq, sp_info['seq'])
                    if sim > best_sim:
                        best_sim = sim
                        best_match = sp_id
                asv_to_species[asv_seq] = (best_match, best_sim)
    
    # 过滤低置信度
    asv_to_species = {k: v for k, v in asv_to_species.items() if v[1] >= 0.97}
    print(f"   高置信度ASV注释: {len(asv_to_species)} 个")
    return asv_to_species


def build_feature_table(sample_feature_tables, asv_to_species, all_samples):
    """
    Step 2.3: 构建Feature Table (ASV × Sample 矩阵)
    
    这是整个下游分析的核心数据表，等价于QIIME2的 feature-table.qza
    """
    print("\n📊 Step 2.3: 构建Feature Table")
    
    all_asvs = sorted(asv_to_species.keys())
    feature_table = pd.DataFrame(0, index=range(len(all_asvs)), columns=all_samples)
    asv_annotations = []
    
    for i, asv in enumerate(all_asvs):
        sp_id, sim = asv_to_species[asv]
        # 这里简化: 直接获取species_db
        sp_name = None
        sp_group = None
        for sid, info in species_db.items():
            if sid == sp_id:
                sp_name = info['name']
                sp_group = info['group']
                break
        
        asv_annotations.append({
            "ASV_ID": f"ASV{i+1:03d}", "species_id": sp_id,
            "species_name": sp_name, "species_group": sp_group,
            "similarity": round(sim, 4),
        })
        for sample_id in all_samples:
            feature_table.loc[i, sample_id] = sample_feature_tables[sample_id].get(asv, 0)
    
    feature_table.index = [a["ASV_ID"] for a in asv_annotations]
    print(f"   Feature Table: {feature_table.shape[0]} ASVs × {feature_table.shape[1]} samples")
    return feature_table, asv_annotations


def calculate_alpha_diversity(feature_table, metadata):
    """
    Step 2.4: α多样性分析
    
    指标:
    - Observed_ASVs: 观测到的ASV数量 (物种丰富度)
    - Shannon: Shannon多样性指数 (兼顾丰富度和均匀度)
    - Simpson: Simpson多样性指数 (优势度指数)
    - Chao1: Chao1丰富度估计 (校正未观测物种)
    """
    print("\n📈 Step 2.4: α多样性分析")
    
    def shannon(counts):
        total = sum(counts)
        return -sum((c / total) * math.log(c / total) for c in counts if c > 0) if total > 0 else 0
    
    def simpson(counts):
        total = sum(counts)
        return 1 - sum((c / total) ** 2 for c in counts if c > 0) if total > 0 else 0
    
    def chao1(counts):
        counts = [c for c in counts if c > 0]
        s_obs = len(counts)
        f1 = sum(1 for c in counts if c == 1)
        f2 = sum(1 for c in counts if c == 2)
        return s_obs + (f1 * (f1 - 1)) / (2 * (f2 + 1)) if f2 > 0 else s_obs
    
    alpha_div = []
    for sample_id in feature_table.columns:
        counts = feature_table[sample_id].tolist()
        alpha_div.append({
            "sample_id": sample_id, "Observed_ASVs": sum(1 for c in counts if c > 0),
            "Shannon": round(shannon(counts), 3), "Simpson": round(simpson(counts), 3),
            "Chao1": round(chao1(counts), 1), "Total_Reads": sum(counts),
        })
    
    alpha_df = pd.DataFrame(alpha_div).merge(metadata, on='sample_id')
    
    print("\n   各站点α多样性:")
    for site, group in alpha_df.groupby('site_name'):
        print(f"   {site}: Shannon={group['Shannon'].mean():.2f}, ASVs={group['Observed_ASVs'].mean():.1f}, Chao1={group['Chao1'].mean():.1f}")
    
    return alpha_df


def calculate_beta_diversity(feature_table, metadata):
    """
    Step 2.5: β多样性分析
    
    使用Bray-Curtis距离衡量样本间群落差异，PCA降维可视化(PCoA)
    """
    print("\n📉 Step 2.5: β多样性 (Bray-Curtis + PCoA)")
    
    ft_t = feature_table.T
    bc_dist = pdist(ft_t.values, metric='braycurtis')
    bc_matrix = squareform(bc_dist)
    bc_df = pd.DataFrame(bc_matrix, index=ft_t.index, columns=ft_t.index)
    
    pca = PCA(n_components=2)
    pca_coords = pca.fit_transform(ft_t.values)
    pca_df = pd.DataFrame(pca_coords, columns=['PC1', 'PC2'], index=ft_t.index)
    pca_df = pca_df.reset_index().rename(columns={'index': 'sample_id'})
    pca_df = pca_df.merge(metadata, on='sample_id')
    
    print(f"   PC1={pca.explained_variance_ratio_[0]*100:.1f}%, PC2={pca.explained_variance_ratio_[1]*100:.1f}%")
    return bc_df, pca_df, pca


def summarize_species_composition(feature_table, asv_annotations, species_db, metadata):
    """Step 2.6: 物种组成汇总"""
    print("\n🐟 Step 2.6: 物种组成汇总")
    
    species_table = defaultdict(lambda: defaultdict(int))
    for asv_id, row in feature_table.iterrows():
        sp_id = next(a['species_id'] for a in asv_annotations if a['ASV_ID'] == asv_id)
        sp_name = None
        sp_group = None
        for sid, info in species_db.items():
            if sid == sp_id:
                sp_name = info['name']
                sp_group = info['group']
                break
        for sample_id, count in row.items():
            species_table[sample_id][(sp_name, sp_group)] += count
    
    species_df_data = []
    for sample_id, sc in species_table.items():
        total = sum(sc.values())
        for (sp_name, sp_group), count in sc.items():
            species_df_data.append({
                'sample_id': sample_id, 'species_name': sp_name, 'species_group': sp_group,
                'count': count, 'relative_abundance': round(count / total * 100, 2) if total > 0 else 0,
            })
    return pd.DataFrame(species_df_data)


def detect_invasive_species(species_df, metadata):
    """Step 2.7: 入侵物种检测"""
    print("\n⚠️ Step 2.7: 入侵物种检测 —— 互花米草")
    
    spartina = species_df[species_df['species_name'] == '互花米草'].merge(metadata, on='sample_id')
    print("\n   互花米草相对丰度:")
    for _, row in spartina.iterrows():
        alert = " 🚨 高风险!" if row['relative_abundance'] > 15 else ""
        print(f"   {row['site_name']} ({row['sample_id']}): {row['relative_abundance']}% {alert}")
    return spartina


# ==================== PART 3: 可视化 ====================

def generate_visualizations(alpha_df, pca_df, pca, species_df, output_dir):
    """生成所有分析图表"""
    print("\n📊 Step 3: 生成可视化图表")
    
    plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'Arial Unicode MS']
    plt.rcParams['axes.unicode_minus'] = False
    
    # 图1: α多样性箱线图
    fig, axes = plt.subplots(1, 3, figsize=(15, 5))
    for ax, metric in zip(axes, ['Observed_ASVs', 'Shannon', 'Chao1']):
        order = alpha_df.groupby('site_name')[metric].median().sort_values(ascending=False).index
        sns.boxplot(data=alpha_df, x='site_name', y=metric, order=order, 
                    palette='Set2', ax=ax, hue='site_name', legend=False)
        ax.set_xlabel(''); ax.set_title(f'{metric} 多样性', fontsize=12)
        ax.tick_params(axis='x', rotation=20)
    plt.suptitle('泉州eDNA采样点 α多样性比较', fontsize=14, fontweight='bold')
    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "fig_alpha_diversity.png"), dpi=150, bbox_inches='tight')
    plt.close()
    print("   ✓ 图1: fig_alpha_diversity.png")
    
    # 图2: PCoA散点图
    fig, ax = plt.subplots(figsize=(10, 8))
    colors = {'泉州湾河口': '#e74c3c', '围头湾': '#2ecc71', '大港湾': '#f39c12', '晋江中游': '#3498db'}
    for site_name, group in pca_df.groupby('site_name'):
        ax.scatter(group['PC1'], group['PC2'], label=site_name, s=150,
                   c=colors.get(site_name, 'gray'), alpha=0.8, edgecolors='black')
        for _, row in group.iterrows():
            ax.annotate(row['sample_id'], (row['PC1'], row['PC2']), 
                       fontsize=9, xytext=(5, 5), textcoords='offset points')
    ax.set_xlabel(f'PC1 ({pca.explained_variance_ratio_[0]*100:.1f}%)')
    ax.set_ylabel(f'PC2 ({pca.explained_variance_ratio_[1]*100:.1f}%)')
    ax.set_title('β多样性 PCoA 分析 (Bray-Curtis距离)', fontsize=14, fontweight='bold')
    ax.legend(loc='best', fontsize=10); ax.grid(True, alpha=0.3)
    fig.savefig(os.path.join(output_dir, "fig_pcoa.png"), dpi=150, bbox_inches='tight')
    plt.close()
    print("   ✓ 图2: fig_pcoa.png")
    
    # 图3: 物种组成堆叠柱状图
    pivot_species = species_df.pivot_table(
        index='sample_id', columns='species_group', 
        values='relative_abundance', aggfunc='sum', fill_value=0)
    all_samples = sorted(species_df['sample_id'].unique())
    pivot_species = pivot_species.reindex(all_samples)
    
    fig, ax = plt.subplots(figsize=(12, 7))
    group_colors = {'鱼类': '#3498db', '入侵植物': '#e74c3c', '珍稀鱼类': '#9b59b6',
                    '浮游动物': '#1abc9c', '底栖生物': '#f39c12', '细菌': '#95a5a6'}
    bottom = np.zeros(len(pivot_species))
    for group in pivot_species.columns:
        ax.bar(pivot_species.index, pivot_species[group], bottom=bottom,
               label=group, color=group_colors.get(group, 'gray'), width=0.7)
        bottom += pivot_species[group].values
    ax.set_ylabel('相对丰度 (%)')
    ax.set_title('泉州eDNA采样点 物种组成 (按生态功能群)', fontsize=14, fontweight='bold')
    ax.legend(loc='upper left', bbox_to_anchor=(1, 1)); ax.tick_params(axis='x', rotation=45)
    plt.tight_layout()
    fig.savefig(os.path.join(output_dir, "fig_species_composition.png"), dpi=150, bbox_inches='tight')
    plt.close()
    print("   ✓ 图3: fig_species_composition.png")
    
    # 图4: 入侵物种热图
    fig, ax = plt.subplots(figsize=(10, 5))
    inv = species_df[species_df['species_group'] == '入侵植物']
    if len(inv) > 0:
        inv_pivot = inv.pivot_table(index='species_name', columns='sample_id', 
                                     values='relative_abundance', fill_value=0)
        sns.heatmap(inv_pivot, annot=True, fmt='.1f', cmap='Reds', ax=ax, 
                    cbar_kws={'label': '相对丰度 (%)'})
        ax.set_title('入侵物种丰度热图', fontsize=14, fontweight='bold')
        plt.tight_layout()
        fig.savefig(os.path.join(output_dir, "fig_invasion_heatmap.png"), dpi=150, bbox_inches='tight')
        plt.close()
        print("   ✓ 图4: fig_invasion_heatmap.png")


# ==================== PART 4: 生态健康评估 ====================

def ecological_health_assessment(alpha_df, species_df, metadata, output_dir):
    """综合生态健康评估"""
    print("\n📋 Step 4: 生态健康评估摘要")
    
    spartina = species_df[species_df['species_name'] == '互花米草'].merge(metadata, on='sample_id')
    
    summary = []
    for site_name, group in alpha_df.groupby('site_name'):
        sh = group['Shannon'].mean()
        obs = group['Observed_ASVs'].mean()
        sp = spartina[spartina['site_name'] == site_name]['relative_abundance'].mean() if len(spartina[spartina['site_name'] == site_name]) > 0 else 0
        
        # 综合健康评分 (0-100)
        score = min(100, max(0, sh * 20 + obs * 2 + (20 - sp) * 2))
        status = "健康" if score >= 70 else "亚健康" if score >= 50 else "不健康"
        
        summary.append({
            "站点": site_name, "Shannon平均": round(sh, 2),
            "ASV数平均": round(obs, 1), "互花米草(%)": round(sp, 1),
            "生态健康评分": round(score, 1), "等级": status,
        })
    
    summary_df = pd.DataFrame(summary).sort_values('生态健康评分', ascending=False)
    
    print("\n" + "=" * 60)
    print("   泉州eDNA生态健康评估摘要")
    print("=" * 60)
    print(summary_df.to_string(index=False))
    print("=" * 60)
    
    return summary_df


# ==================== 主程序入口 ====================

def main():
    """主程序: 完整eDNA分析流程"""
    
    print("=" * 65)
    print("  泉州eDNA宏条形码分析 —— 完整Pipeline")
    print("  模拟场景: 泉州4个海湾/河流站点的12S rRNA eDNA采样")
    print("=" * 65)
    
    # 创建目录
    os.makedirs(DATA_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # === PART 1: 生成数据 ===
    all_samples, species_db = generate_simulated_edna_data(DATA_DIR)
    metadata = pd.read_csv(os.path.join(DATA_DIR, "sample_metadata.csv"), encoding='utf-8-sig')
    
    # === PART 2: 分析Pipeline ===
    sample_feature_tables, sample_raw_stats = run_qc_and_denoise(DATA_DIR, all_samples, species_db)
    asv_to_species = run_taxonomy_annotation(sample_feature_tables, species_db)
    feature_table, asv_annotations = build_feature_table(sample_feature_tables, asv_to_species, all_samples)
    alpha_df = calculate_alpha_diversity(feature_table, metadata)
    bc_df, pca_df, pca = calculate_beta_diversity(feature_table, metadata)
    species_df = summarize_species_composition(feature_table, asv_annotations, species_db, metadata)
    spartina = detect_invasive_species(species_df, metadata)
    
    # === 保存中间结果 ===
    pd.DataFrame(sample_raw_stats).T.to_csv(os.path.join(OUTPUT_DIR, "qc_stats.csv"), encoding='utf-8-sig')
    feature_table.to_csv(os.path.join(OUTPUT_DIR, "feature_table.csv"), encoding='utf-8-sig')
    pd.DataFrame(asv_annotations).to_csv(os.path.join(OUTPUT_DIR, "asv_taxonomy.csv"), index=False, encoding='utf-8-sig')
    alpha_df.to_csv(os.path.join(OUTPUT_DIR, "alpha_diversity.csv"), index=False, encoding='utf-8-sig')
    bc_df.to_csv(os.path.join(OUTPUT_DIR, "braycurtis_distance.csv"), encoding='utf-8-sig')
    pca_df.to_csv(os.path.join(OUTPUT_DIR, "pcoa_coordinates.csv"), index=False, encoding='utf-8-sig')
    species_df.to_csv(os.path.join(OUTPUT_DIR, "species_composition.csv"), index=False, encoding='utf-8-sig')
    
    # === PART 3: 可视化 ===
    generate_visualizations(alpha_df, pca_df, pca, species_df, OUTPUT_DIR)
    
    # === PART 4: 健康评估 ===
    summary_df = ecological_health_assessment(alpha_df, species_df, metadata, OUTPUT_DIR)
    summary_df.to_csv(os.path.join(OUTPUT_DIR, "ecological_health_summary.csv"), index=False, encoding='utf-8-sig')
    
    print(f"\n📁 所有分析结果已保存至: {OUTPUT_DIR}")
    print("\n生成文件列表:")
    for f in sorted(os.listdir(OUTPUT_DIR)):
        print(f"   ✓ {f}")
    
    print("\n" + "=" * 65)
    print("  ✅ 分析完成！")
    print("=" * 65)


if __name__ == "__main__":
    main()
