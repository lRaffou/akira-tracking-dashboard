# Akira Tracking Benchmark

Dashboard personnel pour suivre les performances KovaaK’s sur **Tracking Benchmark by Akira**.

Le dashboard fonctionne directement dans Google Chrome : aucun serveur, aucune API KovaaK’s et aucun programme à laisser ouvert.

## Utilisation

1. Ouvrir `akira-chrome/index.html` dans Google Chrome sur ordinateur.
2. Cliquer sur **Choisir mon dossier Stats**.
3. Sélectionner le dossier local KovaaK’s :

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

Les fichiers KovaaK’s sont lus en lecture seule. Rien n’est envoyé sur Internet. L’historique est enregistré dans le profil Chrome utilisé pour ouvrir la page.

## Données et calculs

Les champs récupérés quand ils sont disponibles sont : scénario, score, date du run, accuracy, hits, misses et dégâts.

Les seuils et les records de référence se trouvent dans `akira-chrome/data.js`. Le rang d’un scénario correspond au dernier seuil atteint. Le rang de catégorie et le rang global sont calculés à partir de la moyenne des points des scénarios.

Les anciens records de référence n’ont pas de date et n’apparaissent donc pas dans les graphiques. Les courbes utilisent uniquement les runs importés depuis les fichiers locaux.

## Sauvegarde

Utiliser **Sauvegarder l’historique** avant de supprimer les données de navigation Chrome ou de changer de profil. Le fichier JSON peut être réimporté avec **Restaurer une sauvegarde**.

## Limites

- Chrome doit rester ouvert pour détecter les nouveaux fichiers ; un onglet en arrière-plan peut être ralenti par le navigateur.
- Le dossier Stats doit être autorisé à nouveau si Chrome perd la permission.
- Les fichiers `.perf` ne sont pas décodés dans cette version ; les `Stats.csv` contiennent déjà les métriques nécessaires.
- Les rangs sont une règle personnelle et ne reproduisent pas nécessairement le calcul officiel Voltaic ou KovaaK’s.
- Le dashboard est conçu pour un usage local et ne doit pas être exposé directement sur Internet.

## Licence

Projet personnel d’Akira. Les icônes et la police Montserrat restent soumises à leurs licences respectives.
