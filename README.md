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

## Actions par scénario

La page présente le niveau global, le tableau, les objectifs de session, le bilan hebdomadaire repliable puis la playlist. Dans les statistiques, le choix du scénario précède les chiffres clés, les filtres et le graphique pour faciliter la lecture.

Chaque ligne propose **Stats**, **Actualiser** et **Jouer**. Jouer ouvre directement le scénario dans KovaaK’s via Steam.

La modal résume le record (référence incluse), la moyenne et le nombre de runs filtrés, ainsi que l’écart entre la moyenne des cinq derniers runs et celle des cinq précédents. Cette comparaison nécessite dix runs parmi les résultats filtrés ; sinon, elle affiche « — ».

Pendant une actualisation, l’icône tourne et un état apparaît sur la ligne : actualisation, à jour, nouveau record ou problème de lecture/connexion.

À droite de chaque nom, l’icône de graphique ouvre les statistiques dans une fenêtre modale (courbes de score et d’accuracy, filtres et historique). Fermer avec **Fermer**, **Échap** ou un clic sur le fond extérieur.

L’évolution des runs apparaît uniquement dans cette fenêtre, sans bloc en doublon sur la page. **Voir mon évolution**, dans les objectifs de session, ouvre la même fenêtre sur le scénario concerné.

L’icône d’actualisation relit les fichiers disponibles puis actualise uniquement la ligne sélectionnée et les rangs qui en dépendent. Les autres scores affichés restent inchangés. Le dossier Stats doit être connecté ; les fichiers tout juste créés attendent le contrôle de stabilité habituel avant leur import. **Actualiser les tableaux** reste disponible pour tout mettre à jour.

## Playlist KovaaK’s

**Tracking Benchmark by Akira - Training**

Code de partage : `KovaaKsNerfingInvincibleChaingun`

[Rechercher la playlist sur KovaaK’s](https://kovaaks.com/kovaaks/playlists?search=KovaaKsNerfingInvincibleChaingun)

Le bouton **Jouer dans KovaaK’s (Steam)** ouvre la playlist directement dans le jeu via Steam. Steam et KovaaK’s doivent être installés ; le navigateur peut demander d’autoriser l’ouverture de Steam. Le lien utilise le [format officiel de lancement des playlists](https://store.steampowered.com/news/posts/?appids=824270&enddate=1652119547&feed=steam_community_announcements).

Le bouton **Copier le code** reste disponible : dans le jeu, ouvrir **Playlists en ligne** et coller le code dans le champ de partage. Le téléchargement `.txt` contient seulement la liste des scénarios et n’est pas une playlist importable dans le jeu.

## Identité visuelle V2

Le thème est défini dans `akira-chrome/akira-v2.css`, chargé après les styles existants : bleu-noir `#09121B` / `#101C28`, corail `#FF405B`, blanc cassé `#ECE9E2` et typographie Montserrat.

La géométrie des barres et des paliers est centralisée dans ce fichier pour éviter les anciennes surcharges contradictoires. Sur les écrans de 900 px ou moins, le tableau devient une liste de cartes avec nom, score, actions, barre et rang du scénario. Les libellés des paliers apparaissent directement dans les barres.

Les barres de progression conservent les couleurs des rangs et présentent un reflet métallique discret avec des ombres pour donner de la profondeur. Les séparations verticales entre les colonnes du benchmark sont masquées ; les séparations horizontales et les contours des barres restent visibles.

Un nouveau record est signalé par un trophée 🏆 à côté du nom du scénario, avec une infobulle « Nouveau record ». Les scores restent modifiables sans encadré au clic ; un soulignement indique le focus lors de la navigation au clavier.

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

L’affichage s’adapte au contexte : `HHhmm` pour les actualisations, `JJ-MM-AAAA HHhmm` pour l’historique et les infobulles des runs. Sur l’axe du graphique, seules les heures apparaissent si les runs sont du même jour, sinon seules les dates. Les dates enregistrées et exportées conservent leur format d’origine.

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
