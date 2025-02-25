<script lang="ts">
  import { authStore } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  
  // Pricing plans
  const plans = [
    {
      name: 'Free',
      description: 'For individuals just getting started',
      price: 0,
      features: [
        '10 extractions per month',
        'Basic table detection',
        'Export to CSV',
        'Copy to clipboard'
      ],
      limitations: [
        'No batch processing',
        'No API access',
        'No advanced extraction options'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      description: 'For professionals with regular needs',
      price: 19,
      features: [
        '100 extractions per month',
        'Advanced table detection',
        'Export to CSV, Excel, and JSON',
        'Batch processing (up to 10 files)',
        'Email support'
      ],
      limitations: [
        'No API access',
        'Limited extraction options'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    },
    {
      name: 'Business',
      description: 'For teams and businesses',
      price: 49,
      features: [
        'Unlimited extractions',
        'Advanced table detection with AI correction',
        'All export formats',
        'Unlimited batch processing',
        'API access',
        'Priority support',
        'Team management'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false
    }
  ];
  
  // Handle plan selection
  function selectPlan(plan: typeof plans[0]) {
    if (!$authStore.user) {
      goto('/signup');
    } else {
      goto('/account?tab=subscription');
    }
  }
</script>

<svelte:head>
  <title>Pricing | Tablextract</title>
</svelte:head>

<div class="py-12">
  <div class="text-center mb-12">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
      Simple, transparent pricing
    </h1>
    <p class="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
      Choose the plan that's right for you. All plans include a 14-day free trial.
    </p>
  </div>
  
  <div class="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
    {#each plans as plan}
      <Card 
        variant="bordered" 
        hoverable 
        class={plan.popular ? 'border-primary-500 ring-1 ring-primary-500' : ''}
      >
        <div class="p-6 space-y-6">
          {#if plan.popular}
            <div class="text-center mb-4">
              <Badge variant="primary" size="md" class="mx-auto">Most Popular</Badge>
            </div>
          {/if}
          
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{plan.name}</h2>
            <p class="mt-1 text-sm text-gray-500">{plan.description}</p>
          </div>
          
          <div>
            <p class="flex items-baseline">
              <span class="text-4xl font-bold text-gray-900">${plan.price}</span>
              {#if plan.price > 0}
                <span class="ml-1 text-gray-500">/month</span>
              {/if}
            </p>
          </div>
          
          <div class="space-y-4">
            <h3 class="text-sm font-medium text-gray-900">Features</h3>
            <ul class="space-y-2">
              {#each plan.features as feature}
                <li class="flex items-start">
                  <svg class="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-sm text-gray-700">{feature}</span>
                </li>
              {/each}
              
              {#each plan.limitations as limitation}
                <li class="flex items-start">
                  <svg class="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span class="text-sm text-gray-500">{limitation}</span>
                </li>
              {/each}
            </ul>
          </div>
          
          <Button 
            fullWidth 
            variant={plan.popular ? 'primary' : 'outline'} 
            on:click={() => selectPlan(plan)}
          >
            {plan.cta}
          </Button>
        </div>
      </Card>
    {/each}
  </div>
  
  <div class="mt-16 text-center">
    <h2 class="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
    <div class="mt-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h3 class="text-lg font-medium text-gray-900">What happens when I reach my extraction limit?</h3>
        <p class="mt-2 text-gray-600">
          You'll be notified when you're approaching your limit. Once you reach it, you can upgrade to a higher plan or wait until the next billing cycle.
        </p>
      </div>
      
      <div>
        <h3 class="text-lg font-medium text-gray-900">Can I cancel my subscription at any time?</h3>
        <p class="mt-2 text-gray-600">
          Yes, you can cancel your subscription at any time. Your plan will remain active until the end of the current billing period.
        </p>
      </div>
      
      <div>
        <h3 class="text-lg font-medium text-gray-900">Do you offer custom plans for larger teams?</h3>
        <p class="mt-2 text-gray-600">
          Yes, we offer custom plans for larger teams and enterprises. Please contact our sales team for more information.
        </p>
      </div>
    </div>
  </div>
</div> 