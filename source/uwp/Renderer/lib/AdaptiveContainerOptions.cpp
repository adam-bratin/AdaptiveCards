#include "pch.h"
#include "AdaptiveContainerOptions.h"
#include "AdaptiveSeparationOptions.h"

using namespace Microsoft::WRL;
using namespace ABI::AdaptiveCards::XamlCardRenderer;

namespace AdaptiveCards { namespace XamlCardRenderer
{
    HRESULT AdaptiveContainerOptions::RuntimeClassInitialize() noexcept try
    {
        return S_OK;
    } CATCH_RETURN;


    HRESULT AdaptiveContainerOptions::RuntimeClassInitialize(ContainerOptions containerOptions) noexcept
    {
        m_sharedContainerOptions = containerOptions;
        return S_OK;
    }

    _Use_decl_annotations_
    HRESULT AdaptiveContainerOptions::get_Separation(IAdaptiveSeparationOptions** separationOptions)
    {
        return MakeAndInitialize<AdaptiveSeparationOptions>(separationOptions, m_sharedContainerOptions.separation);
    }

    _Use_decl_annotations_
    HRESULT AdaptiveContainerOptions::put_Separation(IAdaptiveSeparationOptions*)
    {
        return E_NOTIMPL;
    }
}
}
