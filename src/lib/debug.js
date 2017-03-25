export const gameStats = state => {
    const {
        enemies: { items: enemies, projectiles: enemiesProjectiles },
        bonuses: { items: bonuses },
        game:    { rewards, popups },
        weapons: {
            shots:    { projectiles: shots    },
            missiles: { projectiles: missiles },
        },
    } = state

    return [
        { type: 'shots',               count: shots.length              },
        { type: 'missiles',            count: missiles.length           },
        { type: 'enemies',             count: enemies.length            },
        { type: 'enemies projectiles', count: enemiesProjectiles.length },
        { type: 'bonuses',             count: bonuses.length            },
        { type: 'rewards',             count: rewards.length            },
        { type: 'popups',              count: popups.length             },
        { type: 'TOTAL',               count: _.sum([
            shots.length,
            missiles.length,
            enemies.length,
            bonuses.length,
            enemiesProjectiles.length,
            rewards.length,
            popups.length,
        ])},
    ]
}