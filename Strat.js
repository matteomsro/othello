class Player extends Agent{
    constructor(){
    super()
    this.board = new Board()
    }
    
    
    //implémentation de l'algorithme min-max qui va retourner le meilleur coup à jouer. Nous retrouvons dans les variables
    // (board,color) pour connaître la situation du jeu 
    
    minimax(board, color, profondeur, joueur_max) {
      // Si nous avons atteint la profondeur maximale ou que l'état est terminal,
      // nous renvoyons l'évaluation de l'état.
      if (profondeur === 0 || this.etat_terminale(board)) {
        return this.evaluation(board,color);
        
      }
    
      // Obtention de la liste des coups possibles pour le joueur en cours.
      let coups_possibles = this.board.valid_moves(board,color);
    
      // Initialisation du score et du meilleur coup à jouer.
      let meilleur_score = joueur_max ? -Infinity : Infinity;
      let meilleur_coup = null;
    
      // Pour chaque coup possible, nous effectuons la récursion minimax
      // pour obtenir le score de l'état résultant.
      for (let coup of coups_possibles) {
        let nouvel_etat = this.effectuer_coup(board, color, coup);
        let score = this.minimax(nouvel_etat.board, nouvel_etat.color, profondeur-1, !joueur_max);
    
        // Si le joueur en cours est le joueur_max, nous cherchons le score maximal,
        // sinon nous cherchons le score minimal.
        if (joueur_max) {
          if (score > meilleur_score) {
            meilleur_score = score;
            meilleur_coup = coup;
          }
        } else {
          if (score < meilleur_score) {
            meilleur_score = score;
            meilleur_coup = coup;
          }
        }
      }
    
      // Nous retournons le meilleur coup possible.
      return meilleur_coup;
    }
    
    //permet de simuler le coup suivant à partir de l'état étudié
    
    effectuer_coup(board, color, coup) {
      let nouvel_board = this.board.clone(board)
     // Crée une copie de board
      this.board.move(nouvel_board, coup[0], coup[1], color); // Joue le coup sur le nouvel_board
      let nouvel_color = (color === 'B') ? 'W' : 'B'; // Change de joueur
      return { board: nouvel_board, color: nouvel_color }; // Renvoie un nouvel état
    }
    
    //vérifie que plus personne ne peut jouer --> fin du game
    etat_terminale(board) {
      const coups_possibles_blanc = this.board.valid_moves(board, 'W');
      const coups_possibles_noir = this.board.valid_moves(board, 'B');
      return coups_possibles_blanc.length === 0 && coups_possibles_noir.length === 0;
    }
    
    
    /*Prend en argument la situation de jeu étudié, calcule la liste des coups possibles pour le joueur et renvoie une liste
    *le taux de pertinence pour chacune de ces possibilités.
    *
    *Pour l'instant le score est calculé en faisant juste la différence entre le nombre de jetons d'une couleur sur l'autre
    *Mais le but va être ensuite d'affiner ce calcul de score via pleins de sous-fonctions
    */
    evaluation(board, color) {
      const coups_possibles = this.board.valid_moves(board, color);
      let adversaire;
      if (color == 'B'){
        adversaire = 'W';
      }
      else{
        adversaire = 'B';
      }
      const evaluations = [];
    
      
      for (let coup of coups_possibles) {
        const nouvel_etat = this.effectuer_coup(board, color, coup);
        //var score = this.count_color(nouvel_etat.board, color) - this.count_color(nouvel_etat.board, adversaire);
        var score = 0
    
        if (this.is_on_edge(coup)) {
          // Améliorer le score si le coup est sur le bord
          score += 40.0; // Augmenter ou ajuster ce coefficient selon la pertinence souhaitée
        }
    
        if (this.is_corner_move(coup)) {
          // Augmenter le score si le coup est sur un coin
          score += 100.0; // Augmenter ou ajuster ce coefficient selon la pertinence souhaitée
        } else if (this.is_adjacent_to_corner(coup)) {
          // Diminuer le score si le coup est à côté d'un coin
          score -= 100.0; // Augmenter ou ajuster ce coefficient selon la pertinence souhaitée
        }
    
        const adversaire_moves = this.board.valid_moves(nouvel_etat.board, adversaire);
        if (adversaire_moves.length < 3) {
          // Augmenter le score si le coup empêche à l'adversaire d'avoir beaucoup d'opportunités de jeu
          score += 100.0; // Augmenter ou ajuster ce coefficient selon la pertinence souhaitée
        }
    
        if (this.isIsolated(nouvel_etat.board, coup, color)){
          score -= 1000
        }
    
        if (this.count_color(nouvel_etat.board,color)> this.count_color(nouvel_etat.board, adversaire)){
          score += 40
        }
    
        if (this.count_color(nouvel_etat.board,color)< this.count_color(nouvel_etat.board, adversaire)){
          score -= 40
        }
    
        score += this.evaluateMobility(nouvel_etat.board,color,adversaire)
    
    
        evaluations.push(score);
      }
      
      return evaluations;
    }
    
    
    evaluateMobility(board, color, adversaire) {
        const valid_moves = this.board.valid_moves(board, color);
        const adversaire_moves = this.board.valid_moves(board, adversaire);
    
        const mobility_score = valid_moves.length - adversaire_moves.length;
    
        return mobility_score*100;
    }
    
    
    is_on_edge(move) {
      const [x,y] = move;
        const size = this.board.length;
        return x === 0 || x === size - 1 || y === 0 || y === size - 1;
    }
    
    //éviter les pions isolés
    isIsolated(board, move, color) {
        const [x,y] = move;
        const size = this.board.length;
        // Check if there are neighboring pieces of the same color
        const neighbors = [
          [x - 1, y - 1], [x - 1, y], [x - 1, y + 1],
          [x, y - 1],                 [x, y + 1],
          [x + 1, y - 1], [x + 1, y], [x + 1, y + 1]
        ];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < size && ny >= 0 && ny < size && board[nx][ny] === color) {
            return false; // Found a neighboring piece of the same color
          }
        }
        return true; // No neighboring piece of the same color found
      
      return false; // Position is not empty
    }
    
    is_corner_move(move) {
      const [x, y] = move;
      const size = this.board.length;
    
      return (x === 0 && y === 0) ||     // Coin supérieur gauche
             (x === 0 && y === size - 1) ||    // Coin supérieur droit
             (x === size - 1 && y === 0) ||    // Coin inférieur gauche
             (x === size - 1 && y === size - 1); // Coin inférieur droit
    }
    
    is_adjacent_to_corner(move) {
      const [x, y] = move;
      const size = this.board.length;
    
      return (x === 0 && y === 1) ||           // Case adjacente au coin supérieur gauche
             (x === 1 && y === 0) ||           // Case adjacente au coin supérieur gauche
             (x === 0 && y === size - 2) ||    // Case adjacente au coin supérieur droit
             (x === 1 && y === size - 1) ||    // Case adjacente au coin supérieur droit
             (x === size - 2 && y === 0) ||    // Case adjacente au coin inférieur gauche
             (x === size - 1 && y === 1) ||    // Case adjacente au coin inférieur gauche
             (x === size - 2 && y === size - 1) || // Case adjacente au coin inférieur droit
             (x === 1 && y === 1) ||
             (x === 1 && y === size - 2) ||
             (x === size - 2 && y === 1) ||
             (x === size - 2 && y === size - 2) ||
             (x === size - 1 && y === size - 2);  // Case adjacente au coin inférieur droit
    }
    
    
    
    
    count_color(board,color){
      var size = board.length;
      var C = 0;
      for( var i=0; i<size; i++)
        for(var j=0; j<size; j++)
          if(board[i][j]==color) C++
      return C;
    }
    
    compute(board,time){
      for(var i=0; i<10000000; i++){}
      console.log(this.minimax(board,this.color,2,true))
      if (this.minimax(board,this.color,2,true)=== null){
        var valid_moves = this.board.valid_moves(board, this.color);
        var index = Math.floor(valid_moves.length * Math.random())
        var best_move = valid_moves[index];
        return best_move;
      }
      else{
        return this.minimax(board,this.color,2,true);
      }
    }
    
    
    
    }
    