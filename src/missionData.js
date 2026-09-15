export const MISSIONS={
 facility_power:{title:'Restore Facility Power',steps:['Find the emergency generator','Recover a power cell','Activate the launch-control terminal'],next:'rocket_core'},
 rocket_core:{title:'Recover the Ship Core',steps:['Enter the hangar','Install the recovered core','Access the navigation console'],next:'coordinates'},
 coordinates:{title:'Decode the Star Map',steps:['Scan the alien signal','Plot a route to Verdantia','Launch the ship'],next:'verdantia_gate'},
 verdantia_gate:{title:'The Canopy Signal',steps:['Locate the rainforest beacon','Survive the storm valley','Recover the Warden shard'],next:'cryon_gate'},
 cryon_gate:{title:'Cold Memory',steps:['Reach the ice archive','Recover cryogenic navigation data','Defeat or evade the Glacier Titan'],next:'aridion_gate'},
 aridion_gate:{title:'The Buried Archive',steps:['Enter the ruined megacity','Find the Null Choir key','Open the orbital archive'],next:'final_choice'},
 final_choice:{title:'The Silence Protocol',steps:['Choose: restore humanity, destroy the archive, or merge with the Custodian'],next:null}
};
