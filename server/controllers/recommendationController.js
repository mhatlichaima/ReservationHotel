import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Obtenir des recommandations d'hôtels personnalisées
// @route   POST /api/recommendations
// @access  Privé
export const getRecommendations = async (req, res) => {
    let tempFilePath = null;
    
    try {
        console.log('🔵 [1] Début de getRecommendations');
        
        const { 
            budget = 100, 
            adults = 2, 
            children = 0, 
            trip_type = 'leisure',
            weekend_nights = 2,
            week_nights = 3,
            arrival_month = new Date().getMonth() + 1
        } = req.body;

        const userId = req.user._id;

        console.log('🎯 [2] Génération de recommandations pour:', { userId, budget, adults, children, trip_type });

        const userPreferences = {
            budget: parseInt(budget),
            adults: parseInt(adults),
            children: parseInt(children),
            trip_type,
            weekend_nights: parseInt(weekend_nights),
            week_nights: parseInt(week_nights),
            arrival_month: parseInt(arrival_month)
        };

        // Créer un fichier temporaire avec les préférences
        const tempData = {
            preferences: userPreferences,
            user_id: userId.toString()
        };

        tempFilePath = path.join(__dirname, '../../ml-backend/temp_preferences.json');
        
        // S'assurer que le répertoire existe
        const tempDir = path.dirname(tempFilePath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Écrire le fichier temporaire
        fs.writeFileSync(tempFilePath, JSON.stringify(tempData, null, 2));
        console.log('✅ [3] Fichier temporaire créé:', tempFilePath);

        console.log('🐍 [4] Début exécution Python avec spawn...');

        // ✅ SOLUTION: Utiliser spawn au lieu de PythonShell
        const pythonResult = await new Promise((resolve, reject) => {
            const pythonProcess = spawn(
                'C:\\Users\\chaym\\Desktop\\ReservationHotel\\ml-backend\\hotel-ml-env\\Scripts\\python.exe',
                ['-u', 'hotel_recommender_file_based.py'],
                { 
                    cwd: path.join(__dirname, '../../ml-backend'),
                    stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr
                }
            );

            let stdout = '';
            let stderr = '';

            pythonProcess.stdout.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                console.log('🐍 Python stdout:', output.trim());
            });

            pythonProcess.stderr.on('data', (data) => {
                const error = data.toString();
                stderr += error;
                console.error('🐍 Python stderr:', error.trim());
            });

            pythonProcess.on('close', (code) => {
                console.log(`🐍 Processus Python terminé avec code: ${code}`);
                
                if (code === 0) {
                    // Filtrer les lignes vides et parser
                    const lines = stdout.split('\n').filter(line => line.trim().length > 0);
                    console.log(`📊 ${lines.length} lignes reçues de Python`);
                    resolve(lines);
                } else {
                    reject(new Error(`Processus Python échoué avec code ${code}: ${stderr}`));
                }
            });

            pythonProcess.on('error', (err) => {
                console.error('🐍 Erreur spawn:', err);
                reject(err);
            });

            // Timeout de sécurité
            setTimeout(() => {
                if (!pythonProcess.killed) {
                    console.log('⏰ Timeout - Arrêt du processus Python');
                    pythonProcess.kill('SIGTERM');
                    reject(new Error('Timeout lors de l\'exécution du script Python'));
                }
            }, 30000); // 30 secondes timeout

        });

        console.log('🔵 [6] Nettoyage fichier temporaire...');
        // Nettoyer le fichier temporaire
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log('✅ [6] Fichier temporaire nettoyé');
        }

        // Traiter le résultat
        if (pythonResult && pythonResult.length > 0) {
            console.log('🔵 [7] Parsing des résultats...');
            
            // Trouver la ligne JSON dans la sortie
            let jsonLine = null;
            for (const line of pythonResult) {
                if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
                    jsonLine = line;
                    break;
                }
            }
            
            if (!jsonLine) {
                throw new Error('Aucun JSON valide trouvé dans la sortie Python');
            }

            console.log('📄 JSON trouvé:', jsonLine.substring(0, 100) + '...');
            const recommendationResult = JSON.parse(jsonLine);
            
            if (recommendationResult.error || recommendationResult.status === 'error') {
                console.error('❌ [7] Erreur dans les résultats:', recommendationResult.error);
                return res.status(500).json({
                    success: false,
                    message: 'Erreur du modèle ML',
                    error: recommendationResult.error
                });
            }

            console.log('✅ [8] Envoi de la réponse au client...');
            // ENVOYER LA RÉPONSE
            return res.json({
                success: true,
                message: `🎉 ${recommendationResult.count} recommandations générées`,
                data: recommendationResult
            });
        } else {
            console.error('❌ [7] Aucun résultat du modèle ML');
            return res.status(500).json({
                success: false,
                message: 'Aucun résultat du modèle ML'
            });
        }

    } catch (error) {
        console.error('❌ [ERROR] Erreur contrôleur recommandations:', error);
        
        // Nettoyer en cas d'erreur
        try {
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
                console.log('✅ [CLEANUP] Fichier temporaire nettoyé après erreur');
            }
        } catch (cleanupError) {
            console.log('⚠️ [CLEANUP] Impossible de nettoyer le fichier temporaire:', cleanupError);
        }
        
        // TOUJOURS ENVOYER UNE RÉPONSE MÊME EN CAS D'ERREUR
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la génération des recommandations',
            error: error.message
        });
    }
};

// @desc    Réentraîner le modèle ML (Admin)
// @route   POST /api/recommendations/train
// @access  Privé/Admin
export const trainModel = async (req, res) => {
    try {
        const options = {
            mode: 'text',
            pythonPath: 'python',
            scriptPath: path.join(__dirname, '../../ml-backend')
        };

        PythonShell.run('train_final_model.py', options, (err, results) => {
            if (err) {
                console.error('❌ Erreur entraînement:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Erreur lors de l\'entraînement du modèle',
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: '✅ Modèle réentraîné avec succès',
                results: results
            });
        });

    } catch (error) {
        console.error('❌ Erreur contrôleur entraînement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur',
            error: error.message
        });
    }
};