# Akira Tracking Benchmark

Dashboard personnel pour suivre les performances KovaaK’s sur **Tracking Benchmark by Akira**.

Le dashboard fonctionne dans Google Chrome sur ordinateur, depuis un fichier local ou GitHub Pages. Aucun serveur applicatif ni API KovaaK’s n’est nécessaire.

- [Ouvrir le dashboard en ligne](https://lraffou.github.io/akira-tracking-dashboard/)
- [Dépôt GitHub](https://github.com/lRaffou/akira-tracking-dashboard)

## Versions et publication

- `main` : version V2 publiée sur GitHub Pages, avec l’identité visuelle Akiraffou.
- `benchmark-V2` : nouvelle identité visuelle Akiraffou, avec fonds bleu-noir, accents corail, textes blanc cassé et panneaux anguleux. Les couleurs des rangs sont conservées.

Chaque push sur `main` publie automatiquement le dossier `akira-chrome` via [le workflow GitHub Pages](.github/workflows/pages.yml). La V2 a été intégrée à `main` et est accessible sur le site public. Un push sur `benchmark-V2` seul ne modifie pas le site public.

## Utilisation

1. Ouvrir le [dashboard en ligne](https://lraffou.github.io/akira-tracking-dashboard/) ou le fichier `akira-chrome/index.html` dans Google Chrome sur ordinateur.
2. Déplier **Dossier Stats et sauvegardes**, puis cliquer sur **Choisir mon dossier Stats**.
3. Sélectionner le dossier local KovaaK’s. Exemple à adapter à l’emplacement de Steam :

   `D:\SteamLibrary\steamapps\common\FPSAimTrainer\FPSAimTrainer\stats`

4. Autoriser l’accès en lecture.
5. Garder l’onglet ouvert pendant l’entraînement.

Les nouveaux fichiers `Stats.csv` sont détectés automatiquement. Clique sur **Actualiser les tableaux** pour mettre à jour l’affichage sans faire sauter la page.

## Fonctionnalités

- tableau inspiré de Voltaic avec les cinq paliers Bronze à Diamond ;
- icônes de rang personnalisées ;
- rang par scénario, rang par catégorie et rang global ;
- progression vers le palier suivant ;
- objectifs de session ;
- bilan des sept derniers jours ;
- graphiques de score et d’accuracy ;
- filtres par catégorie, rang et période ;
- sauvegarde et restauration de l’historique ;
- mode compact ou aéré ;
- police Montserrat intégrée pour fonctionner hors ligne.

## Playlist KovaaK’s

**Tracking Benchmark by Akira - Training**

Code de partage : `KovaaKsNerfingInvincibleChaingun`

[Rechercher la playlist sur KovaaK’s](https://kovaaks.com/kovaaks/playlists?search=KovaaKsNerfingInvincibleChaingun)

Dans le jeu, ouvrir **Playlists en ligne** et coller le code dans le champ de partage. Le dashboard propose un bouton **Copier le code**, le lien vers KovaaK’s et un téléchargement de la liste des scénarios en `.txt`. Ce fichier texte n’est pas une playlist importable dans le jeu.

## Identité visuelle V2

Le thème est défini dans `akira-chrome/akira-v2.css`, chargé après les styles existants : bleu-noir `#09121B` / `#101C28`, corail `#FF405B`, blanc cassé `#ECE9E2` et typographie Montserrat.

Les barres de progression conservent les couleurs des rangs et présentent un reflet métallique discret avec des ombres pour donner de la profondeur. Les séparations verticales entre les colonnes du benchmark sont masquées ; les séparations horizontales et les contours des barres restent visibles.

## Scénarios suivis

- Pasu Track Smooth
- Smoothbot Voltaic Easy
- Air Voltaic Invincible 1
- Cata IC Fast Strafes
- Close Fast Strafes Invincible
- VSS GP9
- Thin Aiming Long
- Narrow Strafe
- VT ControlStrafes Valorant
- AD_Strafing_Trainer_Close
- VT PatStrafe Intermediate
- Air Angelic 4 Voltaic Easy

## Architecture

```text
Fichiers Stats.csv KovaaK’s
        ↓
storage.js : lecture et parsing local
        ↓
IndexedDB de Chrome : historique des runs
        ↓
app.js / live.js : calculs, tableau et graphiques
```

Les fichiers KovaaK’s sont lus en lecture seule. Le dashboard n’envoie ni les runs ni l’historique sur Internet. L’historique est enregistré dans IndexedDB, dans le profil Chrome et pour l’adresse de la page utilisée. GitHub Pages héberge uniquement les fichiers du site.

## Données et calculs

Les champs récupérés quand ils sont disponibles sont : scénario, score, date du run, accuracy, hits, misses et dégâts.

Les seuils et les records de référence se trouvent dans `akira-chrome/data.js`. Le rang d’un scénario correspond au dernier seuil atteint. Le rang de catégorie et le rang global sont calculés à partir de la moyenne des points des scénarios.

Les anciens records de référence n’ont pas de date et n’apparaissent donc pas dans les graphiques. Les courbes utilisent uniquement les runs importés depuis les fichiers locaux.

## Sauvegarde

Utiliser **Sauvegarder l’historique** avant de supprimer les données de navigation Chrome ou de changer de profil. Le fichier JSON peut être réimporté avec **Restaurer une sauvegarde**.

La page locale et GitHub Pages ont des historiques séparés. Pour passer de l’une à l’autre, exporter l’historique depuis l’ancienne page puis le restaurer sur la nouvelle. Sélectionner aussi le dossier Stats sur la nouvelle page.

## Limites

- Chrome doit rester ouvert pour détecter les nouveaux fichiers ; un onglet en arrière-plan peut être ralenti par le navigateur.
- Le dossier Stats doit être autorisé à nouveau si Chrome perd la permission.
- Les fichiers `.perf` ne sont pas décodés dans cette version ; les `Stats.csv` contiennent déjà les métriques nécessaires.
- Les rangs sont une règle personnelle et ne reproduisent pas nécessairement le calcul officiel Voltaic ou KovaaK’s.
- Le suivi du dossier Stats nécessite Chrome sur ordinateur et l’autorisation de lecture de l’utilisateur. Sur GitHub Pages, les données restent locales à chaque visiteur ; elles ne sont pas synchronisées entre appareils.

## Licence

Projet personnel d’Akira. Les icônes et la police Montserrat restent soumises à leurs licences respectives.
